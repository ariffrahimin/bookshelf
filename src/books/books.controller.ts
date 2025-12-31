import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
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
  constructor(private readonly booksService: BooksService) { }

  @Get()
  async findAll(
    @Query('author') author?: string,
    @Query('genre') genre?: string,
  ): Promise<Book[]> {
    return this.booksService.findAll(author, genre);
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<Book[]> {
    return this.booksService.search(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Post()
  async create(@Body() book: Omit<Book, 'id'>): Promise<Book> {
    return this.booksService.create(book);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: Partial<Book>,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.booksService.remove(id);
  }
}
