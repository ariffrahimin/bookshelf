import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Book } from './books.controller';

@Injectable()
export class BooksService {
  private readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SECRET_KEY ?? process.env.API_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase env vars. Expected SUPABASE_URL and SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY).',
      );
    }

    this.client = createClient(url, key);
  }

  async findAll(author?: string, genre?: string): Promise<Book[]> {
    let query = this.client
      .from('books')
      .select(
        'id,title,author,publishedYear:published_year,genre,isbn,description',
      );

    if (author) {
      query = query.ilike('author', `%${author}%`);
    }

    if (genre) {
      query = query.ilike('genre', genre);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ?? [];
  }

  async search(q?: string): Promise<Book[]> {
    if (!q) {
      return this.findAll();
    }

    const term = q.toLowerCase();
    const { data, error } = await this.client
      .from('books')
      .select(
        'id,title,author,publishedYear:published_year,genre,isbn,description',
      )
      .or(`title.ilike.%${term}%,author.ilike.%${term}%`);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ?? [];
  }

  async findOne(id: string): Promise<Book> {
    const { data, error } = await this.client
      .from('books')
      .select(
        'id,title,author,publishedYear:published_year,genre,isbn,description',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Book not found');
    }

    return data;
  }

  async create(book: Omit<Book, 'id'>): Promise<Book> {
    const payload = {
      title: book.title,
      author: book.author,
      published_year: book.publishedYear,
      genre: book.genre,
      isbn: book.isbn,
      description: book.description,
    };

    const { data, error } = await this.client
      .from('books')
      .insert(payload)
      .select(
        'id,title,author,publishedYear:published_year,genre,isbn,description',
      )
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async update(id: string, updateBookDto: Partial<Book>): Promise<Book> {
    const payload: Record<string, unknown> = {};

    if (typeof updateBookDto.title !== 'undefined')
      payload.title = updateBookDto.title;
    if (typeof updateBookDto.author !== 'undefined')
      payload.author = updateBookDto.author;
    if (typeof updateBookDto.publishedYear !== 'undefined')
      payload.published_year = updateBookDto.publishedYear;
    if (typeof updateBookDto.genre !== 'undefined')
      payload.genre = updateBookDto.genre;
    if (typeof updateBookDto.isbn !== 'undefined')
      payload.isbn = updateBookDto.isbn;
    if (typeof updateBookDto.description !== 'undefined')
      payload.description = updateBookDto.description;

    const { data, error } = await this.client
      .from('books')
      .update(payload)
      .eq('id', id)
      .select(
        'id,title,author,publishedYear:published_year,genre,isbn,description',
      )
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Book not found');
    }

    return data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const { error, count } = await this.client
      .from('books')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!count) {
      throw new NotFoundException('Book not found');
    }

    return { message: 'Book deleted successfully' };
  }
}
