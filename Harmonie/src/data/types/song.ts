export type Song = {
  id: string;
  title: string;
  download: string;
  source: string;
  comment: string | null;
  tags: string | null;
  author: string | null;
  dateUploaded: Date | null;
  origin: string;
};
