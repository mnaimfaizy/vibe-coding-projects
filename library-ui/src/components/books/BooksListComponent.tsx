import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Star, Eye, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  genre: string;
  publishedYear: number;
  available: boolean;
}

export function BooksListComponent() {
  // Sample books data - in a real app, this would come from API
  const books: Book[] = [
    {
      id: 1,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200',
      rating: 4.5,
      genre: 'Classic',
      publishedYear: 1960,
      available: true
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200',
      rating: 4.7,
      genre: 'Dystopian',
      publishedYear: 1949,
      available: true
    },
    {
      id: 3,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200',
      rating: 4.3,
      genre: 'Classic',
      publishedYear: 1925,
      available: false
    },
    {
      id: 4,
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200',
      rating: 4.4,
      genre: 'Romance',
      publishedYear: 1813,
      available: true
    },
    {
      id: 5,
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      cover: 'https://images.unsplash.com/photo-1633477189729-9290b3261d0a?q=80&w=200',
      rating: 4.6,
      genre: 'Fantasy',
      publishedYear: 1937,
      available: true
    },
    {
      id: 6,
      title: 'Brave New World',
      author: 'Aldous Huxley',
      cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=200',
      rating: 4.2,
      genre: 'Dystopian',
      publishedYear: 1932,
      available: false
    },
  ];

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <img 
                  src={book.cover} 
                  alt={`${book.title} cover`} 
                  className="w-16 h-20 object-cover rounded-sm"
                />
              </TableCell>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>
                <Badge variant="outline">{book.genre}</Badge>
              </TableCell>
              <TableCell>{book.publishedYear}</TableCell>
              <TableCell>{renderRating(book.rating)}</TableCell>
              <TableCell>
                <Badge variant={book.available ? "default" : "destructive"}>
                  {book.available ? "Available" : "Unavailable"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}