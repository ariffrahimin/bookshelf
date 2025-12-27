import { Controller, Get, Post, Body, Param, Put, Delete, Query, NotFoundException } from '@nestjs/common';

export interface Book {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
  genre?: string;
  isbn?: string;
  description?: string;
}

@Controller('books')
export class BooksController {
  private books: Book[] = [];

  // GET /books - Get all books with optional filtering
  @Get()
  findAll(@Query('author') author?: string, @Query('genre') genre?: string): Book[] {
    let result = [...this.books];
    
    if (author) {
      result = result.filter(book => 
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }
    
    if (genre) {
      result = result.filter(book => 
        book.genre?.toLowerCase() === genre.toLowerCase()
      );
    }
    
    return result;
  }

  // GET /books/:id - Get a single book by ID
  @Get(':id')
  findOne(@Param('id') id: string): Book {
    const book = this.books.find(book => book.id === id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  // POST /books - Create a new book
  @Post()
  create(@Body() book: Omit<Book, 'id'>): Book {
    const newBook = {
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      ...book
    };
    this.books.push(newBook);
    return newBook;
  }

  // PUT /books/:id - Update a book
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookDto: Partial<Book>): Book {
    const index = this.books.findIndex(book => book.id === id);
    if (index === -1) {
      throw new NotFoundException('Book not found');
    }
    this.books[index] = { ...this.books[index], ...updateBookDto };
    return this.books[index];
  }

  // DELETE /books/:id - Delete a book
  @Delete(':id')
  remove(@Param('id') id: string): { message: string } {
    const index = this.books.findIndex(book => book.id === id);
    if (index === -1) {
      throw new NotFoundException('Book not found');
    }
    this.books.splice(index, 1);
    return { message: 'Book deleted successfully' };
  }

  // GET /books/search - Search books by title or author
  @Get('search')
  search(@Query('q') query: string): Book[] {
    if (!query) {
      return this.books;
    }
    const searchTerm = query.toLowerCase();
    return this.books.filter(
      book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );
  }
}
