import requests
import psycopg2
from psycopg2 import sql
from bs4 import BeautifulSoup
import re
import uuid
from dotenv import load_dotenv
import os

load_dotenv()
URL = "https://songs.bardmusicplayer.com/?sort=0"

DB_CONFIG = {
    "host": os.getenv("SCRAPPER_DB_HOST"),
    "port": os.getenv("SCRAPPER_DB_PORT"),
    "dbname": os.getenv("SCRAPPER_DB_NAME"),
    "user": os.getenv("SCRAPPER_DB_USER"),
    "password": os.getenv("SCRAPPER_DB_PASSWORD"),
}

def get_user_id_by_name(name):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id FROM \"user\" WHERE name = %s", (name,))
        result = cursor.fetchone()
        
        if result:
            user_id = result[0]
            print(f"Found user ID for '{name}': {user_id}")
            return user_id
        else:
            print(f"No user found with the name '{name}'")
            return None
    except Exception as e:
        print(f"Error fetching user ID: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def get_existing_song_ids(cursor):
    cursor.execute("SELECT \"bmpId\" FROM song")
    existing_ids = cursor.fetchall()
    return set(id[0] for id in existing_ids)

def extract_song_id(download_url):
    match = re.search(r"dl=(\d+)", download_url)
    return match.group(1) if match else None

def extract_tags(title, comment):
    tag_map = {
        1: "solo",
        2: "duet",
        3: "trio",
        4: "quartet",
        5: "quintet",
        6: "sextet",
        7: "septet",
        8: "octet",
        9: "nonet",
        10: "decet"
    }
    found_tags = set()
    combined_text = f"{title.lower()} {comment.lower()}"
    
    # First check for explicit tags
    for tag in tag_map.values():
        if tag in combined_text:
            found_tags.add(tag)
    
    # Handle common variations
    if "duo" in combined_text:
        found_tags.discard("duo")
        found_tags.add("duet")
    
    if "octect" in combined_text:
        found_tags.discard("octect")
        found_tags.add("octet")
    
    if "dectet" in combined_text:
        found_tags.discard("dectet")
        found_tags.add("decet")
    
    # If no tags found, try to extract from track listing
    if not found_tags and comment:
        # Match T followed by numbers (T1, T2, etc)
        track_matches = re.findall(r'T\d+', comment)
        if track_matches:
            unique_tracks = len(track_matches)
            if unique_tracks in tag_map:
                found_tags.add(tag_map[unique_tracks])
    
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
    processed_songs = 0
    
    for entry in midi_list.find_all(class_="midi-entry"):
        try:
            title_element = entry.find("a", class_=["r1", "mtitle"])
            title = title_element.text.strip() if title_element else "Unknown"
            download = f"https://songs.bardmusicplayer.com/{title_element['href']}" if title_element and "href" in title_element.attrs else ""
            
            song_id = extract_song_id(download)
            if not song_id:
                continue
            
            author_element = entry.find("span", class_=["r1", "mauthor"])
            author = author_element.text.strip() if author_element else "Unknown"

            source_element = entry.find("span", class_="r3")
            source = source_element.text.strip().replace("Source: ", "") if source_element else ""

            comment_element = entry.find("span", class_="r4")
            comment = comment_element.text.strip().replace("Comment: ", "") if comment_element else ""
            
            tags = extract_tags(title, comment)
            
            songs.append((song_id, title, download, author, source, comment, tags))
            processed_songs += 1
            print(f"Processing songs... ({processed_songs})", end="\r")
            
        except Exception as e:
            print(f"Error processing entry: {e}")

    return songs

def save_to_database(songs, bmp_user_id) -> int:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    new_songs_count = 0

    existing_song_ids = get_existing_song_ids(cursor)
    new_songs = [song for song in songs if song[0] not in existing_song_ids]
    if len(new_songs) == 0:
        print('\nDone. No new songs to add to the database.')
        return new_songs_count
    print(f'\nDone. Saving {len(new_songs)} new songs to the database...')
    
    for song in new_songs:
        bmp_id, title, download, bmp_author, source, comment, tags = song
        cursor.execute("""
            INSERT INTO song (id, \"bmpId\", title, download, source, comment, tags, \"bmpAuthor\", author)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (str(uuid.uuid4()), bmp_id, title, download, source, comment, tags, bmp_author, bmp_user_id))

        if cursor.rowcount > 0:
          new_songs_count += 1

    conn.commit()
    cursor.close()
    conn.close()
    return new_songs_count

def main():
    bmp_user_id = get_user_id_by_name("bmp")
    if bmp_user_id is None:
        print("No user with 'bmp' name found in database. Aborting.")
        return
    songs = scrape_page(URL)
    if songs:
        new_songs_count = save_to_database(songs, bmp_user_id)
        print(f"{len(songs)} scrapped, {new_songs_count} new songs stored in database.")
    else:
        print("No songs found. Is BMP down?")

if __name__ == "__main__":
    main()
