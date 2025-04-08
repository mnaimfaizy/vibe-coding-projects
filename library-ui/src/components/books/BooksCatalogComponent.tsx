import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Star, Trash } from "lucide-react";

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

export function BooksCatalogComponent() {
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

  const renderStars = (rating: number) => {
    // Round to nearest 0.5
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        // Half star - in a real implementation you might want a proper half-star icon
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden flex flex-col">
          <div className="h-40 overflow-hidden">
            <img 
              src={book.cover} 
              alt={`${book.title} cover`} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between">
              <Badge variant={book.available ? "default" : "destructive"} className="mb-2">
                {book.available ? "Available" : "Unavailable"}
              </Badge>
              <Badge variant="outline">{book.genre}</Badge>
            </div>
            <CardTitle className="text-lg">{book.title}</CardTitle>
            <CardDescription>{book.author} ({book.publishedYear})</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center">
              <div className="flex mr-2">
                {renderStars(book.rating)}
              </div>
              <span className="text-sm text-gray-600">{book.rating.toFixed(1)}</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" className="flex-1">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}