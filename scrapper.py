import requests
import sqlite3
from bs4 import BeautifulSoup

URL = "https://songs.bardmusicplayer.com/?sort=0"

def create_database():
    conn = sqlite3.connect("bmp.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            download TEXT,
            author TEXT,
            source TEXT,
            comment TEXT,
            tags TEXT
        )
    ''')
    conn.commit()
    conn.close()

def extract_tags(title, comment):
    tag_keywords = ["solo", "duet", "trio", "quartet", "quintet", "sextet", "septet", "octet", "nonet", "dectet"]
    found_tags = set()
    
    combined_text = f"{title.lower()} {comment.lower()}"
    
    for tag in tag_keywords:
        if tag in combined_text:
            found_tags.add(tag)
    
    # Edge cases
    if "duo" in combined_text:
        found_tags.discard("duo")
        found_tags.add("duet")
    
    if "octect" in combined_text:
        found_tags.discard("octect")
        found_tags.add("octet")
    
    return ", ".join(sorted(found_tags))

def scrape_page(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch page: {response.status_code}")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")
    midi_list = soup.find(class_="midi-list")
    if not midi_list:
        print("No midi list found on the page.")
        return []
    
    songs = []
    for entry in midi_list.find_all(class_="midi-entry"):
        try:
            title_element = entry.find("a", class_=["r1", "mtitle"])
            title = title_element.text.strip() if title_element else "Unknown"
            download = f"https://songs.bardmusicplayer.com/{title_element['href']}" if title_element and "href" in title_element.attrs else ""

            author_element = entry.find("span", class_=["r1", "mauthor"])
            author = author_element.text.strip() if author_element else "Unknown"

            source_element = entry.find("span", class_="r3")
            source = source_element.text.strip().replace("Source: ", "") if source_element else ""

            comment_element = entry.find("span", class_="r4")
            comment = comment_element.text.strip().replace("Comment: ", "") if comment_element else ""

            tags = extract_tags(title, comment)
            
            songs.append((title, download, author, source, comment, tags))
        except Exception as e:
            print(f"Error processing an entry: {e}")
    
    return songs

def save_to_database(songs):
    conn = sqlite3.connect("bmp.db")
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO songs (title, download, author, source, comment, tags)
        VALUES (?, ?, ?, ?, ?, ?)
    """, songs)
    conn.commit()
    conn.close()

def main():
    create_database()
    songs = scrape_page(URL)
    if songs:
        save_to_database(songs)
        print(f"{len(songs)} songs saved to database.")
    else:
        print("No songs found.")

if __name__ == "__main__":
    main()
