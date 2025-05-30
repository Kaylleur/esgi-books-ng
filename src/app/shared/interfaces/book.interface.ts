export interface Book {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  isbn: string;
  price: number;
  quantity: number;
  reviews: { user: string; message: string; rating: number }[];
}
