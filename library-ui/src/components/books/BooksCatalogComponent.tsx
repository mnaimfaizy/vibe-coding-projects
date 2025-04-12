import { useState, useEffect } from "react";
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
import {
  Edit,
  Star,
  Trash,
  BookmarkPlus,
  BookmarkCheck,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import BookService, { Book } from "@/services/bookService";
import { toast } from "sonner";

export function BooksCatalogComponent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userCollection, setUserCollection] = useState<number[]>([]);

  useEffect(() => {
    fetchBooks();
    fetchUserCollection();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await BookService.getAllBooks();

      // Handle the response properly, ensuring it's an array
      if (Array.isArray(response)) {
        setBooks(response);
      } else if (
        response &&
        typeof response === "object" &&
        "books" in response
      ) {
        // If API returns {books: [...]} format
        setBooks(response.books as Book[]);
      } else {
        console.error("Unexpected API response format:", response);
        setBooks([]);
        toast.error("Received invalid data format from API");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books catalog.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollection = async () => {
    try {
      const response = await BookService.getUserCollection();

      // Handle the response properly, ensuring we get an array of books
      if (Array.isArray(response)) {
        const bookIds = response
          .map((book) => book.id as number)
          .filter(Boolean);
        setUserCollection(bookIds);
      } else if (
        response &&
        typeof response === "object" &&
        "books" in response
      ) {
        // If API returns {books: [...]} format
        const bookIds = (response.books as Book[])
          .map((book) => book.id as number)
          .filter(Boolean);
        setUserCollection(bookIds);
      } else {
        console.error(
          "Unexpected API response format for user collection:",
          response
        );
        setUserCollection([]);
      }
    } catch (error) {
      console.error("Error fetching user collection:", error);
      setUserCollection([]);
    }
  };

  const handleAddToCollection = async (bookId: number) => {
    try {
      await BookService.addToUserCollection(bookId);
      setUserCollection([...userCollection, bookId]);
      toast.success("Book added to your collection.");
    } catch (error) {
      toast.error("Failed to add book to collection.");
      console.error("Error adding book to collection:", error);
    }
  };

  const handleRemoveFromCollection = async (bookId: number) => {
    try {
      await BookService.removeFromUserCollection(bookId);
      setUserCollection(userCollection.filter((id) => id !== bookId));
      toast.success("Book removed from your collection.");
    } catch (error) {
      toast.error("Failed to remove book from collection.");
      console.error("Error removing book from collection:", error);
    }
  };

  const isInCollection = (bookId?: number) => {
    return bookId ? userCollection.includes(bookId) : false;
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;

    // Round to nearest 0.5
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i - 0.5 === roundedRating) {
        // Half star - in a real implementation you might want a proper half-star icon
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading books...</div>;
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold">No books found</h3>
        <p className="text-muted-foreground mt-2">
          Add some books to the catalog to get started.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/books/create">Add Your First Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card
          key={book.id}
          className="overflow-hidden flex flex-col py-0 gap-1"
        >
          <div className="h-40 overflow-hidden">
            <img
              src={
                book.coverImage ||
                book.cover ||
                "https://via.placeholder.com/200x300?text=No+Cover"
              }
              alt={`${book.title} cover`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              {isInCollection(book.id) ? (
                <Badge variant="secondary" className="mb-2">
                  In Your Collection
                </Badge>
              ) : null}
              <Badge variant="outline">{book.genre || "Uncategorized"}</Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            <CardDescription>
              {book.author}{" "}
              {book.publishedDate
                ? `(${new Date(book.publishedDate).getFullYear()})`
                : book.publishYear
                ? `(${book.publishYear})`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center">{renderRating(4.5)}</div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {book.description || "No description available."}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to={`/books/${book.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>

              {isInCollection(book.id) ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRemoveFromCollection(book.id!)}
                >
                  <BookmarkCheck className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCollection(book.id!)}
                >
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Collect
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
