import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BooksCatalogComponent } from './BooksCatalogComponent';
import { BooksListComponent } from './BooksListComponent';
import { Plus, RefreshCcw } from 'lucide-react';

export function BooksComponent() {
  const [view, setView] = useState('catalog');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, this would fetch data from your API
    setTimeout(() => {
      setIsLoading(false);
      // Here you would update your state with the new data
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Books Collection</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button asChild>
            <a href="/books/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="catalog">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog">
          <BooksCatalogComponent />
        </TabsContent>
        <TabsContent value="list">
          <BooksListComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}