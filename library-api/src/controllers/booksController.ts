import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import axios from 'axios';
import { Book } from '../models/Book';

/**
 * Get all books
 */
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await connectDatabase();
    const books = await db.all('SELECT * FROM books ORDER BY title');
    
    res.status(200).json({ books });
  } catch (error: any) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a single book by ID
 */
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const db = await connectDatabase();
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    res.status(200).json({ book });
  } catch (error: any) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a book manually with provided details
 */
export const createBookManually = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, isbn, publishYear, author, cover, description } = req.body;
    
    // Validate input
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    
    const db = await connectDatabase();
    
    // Check if ISBN already exists
    if (isbn) {
      const existingBook = await db.get('SELECT * FROM books WHERE isbn = ?', [isbn]);
      if (existingBook) {
        res.status(400).json({ message: 'Book with this ISBN already exists' });
        return;
      }
    }
    
    // Create new book
    const result = await db.run(
      `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, isbn || null, publishYear || null, author || null, cover || null, description || null]
    );
    
    if (result.lastID) {
      const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]) as Book;
      res.status(201).json({ 
        message: 'Book created successfully', 
        book: newBook 
      });
    } else {
      res.status(500).json({ message: 'Failed to create book' });
    }
  } catch (error: any) {
    console.error('Error creating book:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a book using ISBN and Open Library API
 */
export const createBookByIsbn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isbn } = req.body;
    
    if (!isbn) {
      res.status(400).json({ message: 'ISBN is required' });
      return;
    }
    
    const db = await connectDatabase();
    
    // Check if book with ISBN already exists
    const existingBook = await db.get('SELECT * FROM books WHERE isbn = ?', [isbn]);
    if (existingBook) {
      res.status(400).json({ message: 'Book with this ISBN already exists' });
      return;
    }
    
    // Fetch book details from Open Library API
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    
    const bookKey = `ISBN:${isbn}`;
    if (!response.data[bookKey]) {
      res.status(404).json({ message: 'Book not found with this ISBN' });
      return;
    }
    
    const bookData = response.data[bookKey];
    
    // Extract relevant data
    const title = bookData.title || 'Unknown Title';
    const author = bookData.authors ? bookData.authors[0]?.name : 'Unknown Author';
    const publishYear = bookData.publish_date ? parseInt(bookData.publish_date.slice(-4)) : null;
    const cover = bookData.cover?.medium || null;
    const description = bookData.description?.value || bookData.description || null;
    
    // Create book in database
    const result = await db.run(
      `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, isbn, publishYear, author, cover, description]
    );
    
    if (result.lastID) {
      const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]) as Book;
      res.status(201).json({ 
        message: 'Book created successfully from ISBN', 
        book: newBook 
      });
    } else {
      res.status(500).json({ message: 'Failed to create book' });
    }
  } catch (error: any) {
    console.error('Error creating book by ISBN:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a book
 */
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, isbn, publishYear, author, cover, description } = req.body;
    
    // Validate input
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    
    const db = await connectDatabase();
    
    // Check if book exists
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    // Check if ISBN is unique (if provided)
    if (isbn && isbn !== book.isbn) {
      const existingBook = await db.get('SELECT * FROM books WHERE isbn = ? AND id != ?', [isbn, id]);
      if (existingBook) {
        res.status(400).json({ message: 'Book with this ISBN already exists' });
        return;
      }
    }
    
    // Update book
    await db.run(
      `UPDATE books 
       SET title = ?, isbn = ?, publishYear = ?, author = ?, cover = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, 
        isbn || null, 
        publishYear || null, 
        author || null, 
        cover || null, 
        description || null,
        id
      ]
    );
    
    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]) as Book;
    
    res.status(200).json({ 
      message: 'Book updated successfully', 
      book: updatedBook 
    });
  } catch (error: any) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const db = await connectDatabase();
    
    // Check if book exists
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    // Delete book
    await db.run('DELETE FROM books WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};