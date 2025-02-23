export interface Song {
  id: string;
  title: string;
  tags: string | null;
  download: string;
  source: string;
  comment: string | null;
  dateUploaded: Date | null;
  authorId: string;
  authorName: string | null;
  origin: string;
}
