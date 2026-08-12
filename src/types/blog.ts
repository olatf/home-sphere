export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  readingTimeMinutes: number;
}
