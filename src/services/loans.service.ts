import { getDB } from "../config/database.js"; 
import { ObjectId } from "mongodb";
import { BookService } from "./books.service.js"; 

interface LoanDTO {
  bookId: string;
  dueDate?: Date;
}

export class LoanService {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  /**
   * Retrieves all loans based on the given query and current user
   * If the current user is not an admin, the query will be filtered by the user's ID.
   * If a status is provided in the query, the query will be filtered by the status.
   * The loans will be sorted by their creation date in descending order and paginated.
   * The pagination object will contain the page, limit, total number of loans and total number of pages.
   * @param {any} query - The query object containing the status, page and limit.
   * @param {any} currentUser - The current user object containing the user's ID and role.
   * @returns {Promise<Object>} - A promise resolving to an object containing the loans and pagination.
   */
  async getAll(query: any = {}, currentUser: any) {
    const db = getDB();
    const { status, page = 1, limit = 10 } = query;

    const filter: any = {};

    if (currentUser.role !== "admin") {
      filter.userId = new ObjectId(currentUser.userId);
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const loans = await db
      .collection("loans")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "books",
            localField: "bookId",
            foreignField: "_id",
            as: "book",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$book" },
        { $unwind: "$user" },
        { $project: { "user.password": 0 } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ])
      .toArray();

    const total = await db.collection("loans").countDocuments(filter);

    return {
      data: loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Retrieves a loan by its ID
   * If the current user is not an admin, the loan must belong to the current user.
   * @param {string} id - The ID of the loan to retrieve.
   * @param {any} currentUser - The current user object containing the user's ID and role.
   * @returns {Promise<Object>} - A promise resolving to the retrieved loan.
   * @throws {Error} - If the loan is not found or if the current user does not have permission to view the loan.
   */
  async getById(id: string, currentUser: any) {
    const db = getDB();

    const loans = await db
      .collection("loans")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "books",
            localField: "bookId",
            foreignField: "_id",
            as: "book",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$book" },
        { $unwind: "$user" },
        { $project: { "user.password": 0 } },
      ])
      .toArray();

    const loan = loans[0];

    if (!loan) {
      throw new Error("Loan not found");
    }

    if (
      currentUser.role !== "admin" &&
      loan.userId.toString() !== currentUser.userId
    ) {
      throw new Error("Forbidden");
    }

    return loan;
  }

  /**
   * Create a new loan.
   * @param {LoanDTO} data - Loan data
   * @param {any} currentUser - Current user
   * @returns {Promise<Loan>} - Created loan
   * @throws {Error} - If book is not available, user has active loans for this book, or user has overdue loans
   */
  async create(data: LoanDTO, currentUser: any) {
    const db = getDB();

    // Check if book exists and has available stock
    const book = await this.bookService.getById(data.bookId);

    if (book.availableStock <= 0) {
      throw new Error("Book is not available for loan");
    }

    // Check if user has active loans for this book
    const activeLoan = await db.collection("loans").findOne({
      userId: new ObjectId(currentUser.userId),
      bookId: new ObjectId(data.bookId),
      status: "active",
    });

    if (activeLoan) {
      throw new Error("You already have an active loan for this book");
    }

    // Check if user has overdue loans
    const overdueLoans = await db.collection("loans").countDocuments({
      userId: new ObjectId(currentUser.userId),
      status: "active",
      dueDate: { $lt: new Date() },
    });

    if (overdueLoans > 0) {
      throw new Error("You have overdue loans. Please return them first.");
    }

    // Calculate due date (14 days from now if not provided)
    const dueDate =
      data.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const loan = {
      userId: new ObjectId(currentUser.userId),
      bookId: new ObjectId(data.bookId),
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      returnDate: null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("loans").insertOne(loan);

    // Update book stock
    await this.bookService.updateStock(data.bookId, -1);

    return {
      ...loan,
      _id: result.insertedId,
    };
  }

  /**
   * Return a book by its loan ID
   * If the current user is not an admin, the loan must belong to the current user.
   * @param {string} id - The ID of the loan to return.
   * @param {any} currentUser - The current user object containing the user's ID and role.
   * @returns {Promise<Object>} - A promise resolving to the returned loan.
   * @throws {Error} - If the loan is not found or if the current user does not have permission to return the loan.
   */
  async returnBook(id: string, currentUser: any) {
    const db = getDB();

    const loan = await db
      .collection("loans")
      .findOne({ _id: new ObjectId(id) });

    if (!loan) {
      throw new Error("Loan not found");
    }

    if (
      currentUser.role !== "admin" &&
      loan.userId.toString() !== currentUser.userId
    ) {
      throw new Error("Forbidden");
    }

    if (loan.status !== "active") {
      throw new Error("Loan is not active");
    }

    const returnDate = new Date();
    const isLate = returnDate > loan.dueDate;

    const result = await db.collection("loans").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          returnDate,
          status: isLate ? "returned_late" : "returned",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    // Update book stock
    await this.bookService.updateStock(loan.bookId.toString(), 1);

    return result;
  }

  /**
   * Retrieves all loans belonging to a user
   * The loans will be sorted by their creation date in descending order.
   * @param {string} userId - The ID of the user to retrieve the loans for.
   * @returns {Promise<Object[]>} - A promise resolving to an array of loans.
   */
  async getUserLoans(userId: string) {
    const db = getDB();

    const loans = await db
      .collection("loans")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "books",
            localField: "bookId",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return loans;
  }
}
