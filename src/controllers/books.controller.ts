import { FastifyRequest, FastifyReply } from "fastify";
import { BookService } from "../services/books.service";
import * as fs from "node:fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { sanitizer } from "../utils/sanitizer";

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  /**
   * Retrieves a list of books based on the query parameters
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const books = await this.bookService.getAll(query);
      return reply.send(books);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Retrieves a book by its ID
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   * @throws {Error} - If the book is not found.
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const book = await this.bookService.getById(id);
      return reply.send(book);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }
  
  /**
   * Creates a new book with the given data
   * The book data can include an image which will be uploaded
   * to the server and stored in the uploads/covers directory.
   * The image will be sanitized and given a unique filename.
   * The book data will be validated against the BookDTO schema.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   * @throws {Error} - If the book data is invalid or the image upload fails.
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const fields: any = {};
      let coverImageUrl: string | null = null;

      for await (const part of request.parts()) {
        if (part.type === "field") {
          fields[part.fieldname] = part.value;
        } else if (part.type === "file" && part.fieldname === "coverImage") {
          const uploadDir = path.join(process.cwd(), "uploads", "covers");
          await fs.mkdir(uploadDir, { recursive: true });

          const safeName = sanitizer(part.filename);
          const filename = `${Date.now()}-${safeName}`;
          const filepath = path.join(uploadDir, filename);

          await pipeline(part.file, createWriteStream(filepath));

          coverImageUrl = `/uploads/covers/${filename}`;
        }
      }

      const bookData = {
        title: fields.title,
        author: fields.author,
        isbn: fields.isbn,
        publisher: fields.publisher,
        publishedYear: fields.publishedYear
          ? parseInt(fields.publishedYear)
          : undefined,
        category: fields.category,
        description: fields.description,
        totalStock: parseInt(fields.totalStock),
        availableStock:
          parseInt(fields.availableStock) || parseInt(fields.totalStock),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      };

      const book = await this.bookService.create(bookData);
      return reply.status(201).send(book);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Updates a book with the given data
   * The book data can include an image which will be uploaded
   * to the server and stored in the uploads/covers directory.
   * The image will be sanitized and given a unique filename.
   * The book data will be validated against the BookDTO schema.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   * @throws {Error} - If the book data is invalid or the image upload fails.
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const fields: any = {};
      let coverImageUrl: string | null = null;

      for await (const part of request.parts()) {
        if (part.type === "field") {
          fields[part.fieldname] = part.value;
        } else if (part.type === "file" && part.fieldname === "coverImage") {
          const uploadDir = path.join(process.cwd(), "uploads", "covers");
          await fs.mkdir(uploadDir, { recursive: true });

          const safeName = sanitizer(part.filename);
          const filename = `${Date.now()}-${safeName}`;
          const filepath = path.join(uploadDir, filename);

          await pipeline(part.file, createWriteStream(filepath));

          coverImageUrl = `/uploads/covers/${filename}`;
        }
      }

      const updateData: any = {};

      if (fields.title) updateData.title = fields.title;
      if (fields.author) updateData.author = fields.author;
      if (fields.isbn) updateData.isbn = fields.isbn;
      if (fields.publisher) updateData.publisher = fields.publisher;
      if (fields.publishedYear)
        updateData.publishedYear = parseInt(fields.publishedYear);
      if (fields.category) updateData.category = fields.category;
      if (fields.description) updateData.description = fields.description;
      if (fields.totalStock)
        updateData.totalStock = parseInt(fields.totalStock);
      if (fields.availableStock)
        updateData.availableStock = parseInt(fields.availableStock);

      if (coverImageUrl) updateData.coverImage = coverImageUrl;

      const updatedBook = await this.bookService.update(id, updateData);
      return reply.send(updatedBook);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Deletes a book by its ID
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   * @throws {Error} - If the book is not found.
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      await this.bookService.delete(id);
      return reply.send({ message: "Book deleted successfully" });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Uploads a cover image for a book
   * The cover image will be sanitized and given a unique filename.
   * The book data will be validated against the BookDTO schema.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} - A promise that resolves to a Fastify reply object.
   * @throws {Error} - If the book data is invalid or the image upload fails.
   */
  async uploadCover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const uploadDir = path.join(process.cwd(), "uploads", "covers");
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
