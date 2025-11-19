import { getDB } from "../config/database";
import { ObjectId } from "mongodb";

interface BookDTO {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  category?: string;
  description?: string;
  coverImage?: string;
  totalStock: number;
  availableStock: number;
}

export class BookService {
  /**
   * Retrieves all books based on the query parameters
   * @param {any} query - Query parameters. Supports search, category, page, and limit.
   * @returns {Promise<Object>} - Object containing the data and pagination information.
   */
  async getAll(query: any = {}) {
    const db = getDB();
    const { search, category, page = 1, limit = 10 } = query;

    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await db
      .collection("books")
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("books").countDocuments(filter);

    return {
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Retrieves a book by ID
   * @param {string} id - The ID of the book.
   * @returns {Promise<Object>} - The book object if found, otherwise throws an error.
   * @throws {Error} - If the book is not found.
   */
  async getById(id: string) {
    const db = getDB();
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(id) });

    if (!book) {
      throw new Error("Book not found");
    }

    return book;
  }

  /**
   * Creates a new book in the database
   * @param {BookDTO} data - The book data to create.
   * @returns {Promise<Object>} - The created book object with an _id property.
   * @throws {Error} - If a book with the same ISBN already exists.
   */
  async create(data: BookDTO) {
    const db = getDB();

    const existingBook = await db
      .collection("books")
      .findOne({ isbn: data.isbn });
    if (existingBook) {
      throw new Error("Book with this ISBN already exists");
    }

    const book = {
      ...data,
      availableStock: data.totalStock,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("books").insertOne(book);

    return {
      ...book,
      _id: result.insertedId,
    };
  }

  /**
   * Updates a book in the database
   * @param {string} id - The ID of the book to update.
   * @param {any} data - The updated book data.
   * @returns {Promise<Object>} - The updated book object if found, otherwise throws an error.
   * @throws {Error} - If the book is not found.
   */
  async update(id: string, data: any) {
    const db = getDB();

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("books")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result) {
      throw new Error("Book not found");
    }

    return result;
  }

  /**
   * Deletes a book from the database
   * @param {string} id - The ID of the book to delete.
   * @returns {Promise<boolean>} - True if the book is deleted, otherwise throws an error.
   * @throws {Error} - If the book is not found or has active loans.
   */
  async delete(id: string) {
    const db = getDB();

    const activeLoans = await db.collection("loans").countDocuments({
      bookId: new ObjectId(id),
      status: "active",
    });

    if (activeLoans > 0) {
      throw new Error("Cannot delete book with active loans");
    }

    const result = await db
      .collection("books")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error("Book not found");
    }

    return true;
  }

  /**
   * Updates the available stock of a book
   * @param {string} id - The ID of the book to update.
   * @param {number} change - The change to apply to the available stock (positive to increase, negative to decrease).
   * @returns {Promise<Object>} - The updated book object if found, otherwise throws an error.
   * @throws {Error} - If the book is not found.
   */
  async updateStock(id: string, change: number) {
    const db = getDB();

    const result = await db
      .collection("books")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { availableStock: change } },
        { returnDocument: "after" }
      );

    if (!result) {
      throw new Error("Book not found");
    }

    return result;
  }
}
