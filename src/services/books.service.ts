import { getDB } from '../config/database';
import { ObjectId } from 'mongodb';

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
      .collection('books')
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('books').countDocuments(filter);

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

  async getById(id: string) {
    const db = getDB();
    const book = await db.collection('books').findOne({ _id: new ObjectId(id) });

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  }

  async create(data: BookDTO) {
    const db = getDB();

    const existingBook = await db.collection('books').findOne({ isbn: data.isbn });
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    const book = {
      ...data,
      availableStock: data.totalStock,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('books').insertOne(book);

    return {
      ...book,
      _id: result.insertedId,
    };
  }

  async update(id: string, data: any) {
    const db = getDB();

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db.collection('books').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Book not found');
    }

    return result;
  }

  async delete(id: string) {
    const db = getDB();
    
    const activeLoans = await db.collection('loans').countDocuments({
      bookId: new ObjectId(id),
      status: 'active',
    });

    if (activeLoans > 0) {
      throw new Error('Cannot delete book with active loans');
    }

    const result = await db.collection('books').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Book not found');
    }

    return true;
  }

  async updateStock(id: string, change: number) {
    const db = getDB();
    
    const result = await db.collection('books').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { availableStock: change } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Book not found');
    }

    return result;
  }
}