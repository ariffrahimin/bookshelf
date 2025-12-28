import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { BooksService } from './books.service';

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
  constructor(private readonly booksService: BooksService) {}

  // GET /books - Get all books with optional filtering
  @Get()
  async findAll(@Query('author') author?: string, @Query('genre') genre?: string): Promise<Book[]> {
    return this.booksService.findAll(author, genre);
  }

  // GET /books/search - Search books by title or author
  @Get('search')
  async search(@Query('q') query: string): Promise<Book[]> {
    return this.booksService.search(query);
  }

  // GET /books/:id - Get a single book by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  // POST /books - Create a new book
  @Post()
  async create(@Body() book: Omit<Book, 'id'>): Promise<Book> {
    return this.booksService.create(book);
  }

  // PUT /books/:id - Update a book
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: Partial<Book>): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  // DELETE /books/:id - Delete a book
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.booksService.remove(id);
  }
}
