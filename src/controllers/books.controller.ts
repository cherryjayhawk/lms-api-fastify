import { FastifyRequest, FastifyReply } from 'fastify';
import { BookService } from '../services/books.service';
import * as fs from 'node:fs/promises';
import { createWriteStream} from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const books = await this.bookService.getAll(query);
      return reply.send(books);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const book = await this.bookService.getById(id);
      return reply.send(book);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const book = await this.bookService.create(data);
      return reply.status(201).send(book);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const data = request.body as any;
      const book = await this.bookService.update(id, data);
      return reply.send(book);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      await this.bookService.delete(id);
      return reply.send({ message: 'Book deleted successfully' });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async uploadCover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'covers');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${id}-${Date.now()}${path.extname(data.filename)}`;
      const filepath = path.join(uploadDir, filename);
      await pipeline(data.file, createWriteStream(filepath));

      const coverUrl = `/uploads/covers/${filename}`;
      await this.bookService.update(id, { coverImage: coverUrl });

      return reply.send({ coverUrl });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}