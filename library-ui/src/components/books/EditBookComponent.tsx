import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  isbn: string;
  description: string;
  coverUrl: string;
  available: boolean;
}

export function EditBookComponent() {
  // In a real app, you would get the book ID from URL params
  const bookId = 1; // Example book ID
  
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Available genres
  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance", 
    "Science Fiction", "Fantasy", "Biography", "History", "Self-Help",
    "Business", "Children's Books", "Young Adult", "Horror", "Poetry",
    "Classic", "Dystopian", "Adventure"
  ];
  
  // Simulate fetching book details
  useEffect(() => {
    // In a real app, this would be an API call to get book details
    setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      const book: Book = {
        id: 1,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic',
        publishedYear: 1960,
        isbn: '9780061120084',
        description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. "To Kill A Mockingbird" became both an instant bestseller and a critical success when it was first published in 1960.',
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200',
        available: true
      };
      
      // Set form state with book data
      setTitle(book.title);
      setAuthor(book.author);
      setGenre(book.genre);
      setPublishedYear(book.publishedYear.toString());
      setIsbn(book.isbn);
      setDescription(book.description);
      setCoverUrl(book.coverUrl);
      setAvailable(book.available);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real implementation, this would be an API call to update the book
    setTimeout(() => {
      console.log('Book updated:', { 
        id: bookId,
        title, 
        author, 
        genre, 
        publishedYear: parseInt(publishedYear), 
        isbn,
        description,
        coverUrl,
        available
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Clear success message after some time
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading book details...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>
        <h1 className="text-3xl font-bold">Edit Book</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Edit Book Information
          </CardTitle>
          <CardDescription>
            Update the book details below
          </CardDescription>
        </CardHeader>
        
        {isSuccess && (
          <Alert className="mx-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Book successfully updated!
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Book Preview */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <img 
                  src={coverUrl || 'https://via.placeholder.com/150x200?text=No+Cover'} 
                  alt="Book cover preview" 
                  className="w-32 h-40 object-cover rounded-md shadow-md" 
                />
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-gray-600">by {author}</p>
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="Enter book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                <Input
                  id="author"
                  placeholder="Enter author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
              
              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre">Genre <span className="text-red-500">*</span></Label>
                <Select value={genre} onValueChange={setGenre} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Published Year */}
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  placeholder="YYYY"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                />
              </div>
              
              {/* ISBN */}
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="Enter ISBN number"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>
              
              {/* Cover URL */}
              <div className="space-y-2">
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter book description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              
              {/* Availability Switch */}
              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch
                  id="available"
                  checked={available}
                  onCheckedChange={setAvailable}
                />
                <Label htmlFor="available">Book is available for borrowing</Label>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" asChild>
              <a href="/books">Cancel</a>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}