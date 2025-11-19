import { FastifyRequest, FastifyReply } from "fastify";
import { LoanService } from "../services/loans.service";

export class LoanController {
  private loanService: LoanService;

  constructor() {
    this.loanService = new LoanService();
  }

  /**
   * Get all loans.
   * @param {FastifyRequest} request - Fastify request object
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs while retrieving loans
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const currentUser = (request as any).user;
      const query = request.query as any;

      const loans = await this.loanService.getAll(query, currentUser);
      return reply.send(loans);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Get a loan by its ID.
   * @param {FastifyRequest} request - Fastify request object
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs while retrieving the loan
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const currentUser = (request as any).user;

      const loan = await this.loanService.getById(id, currentUser);
      return reply.send(loan);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }

  /**
   * Create a new loan.
   * @param {FastifyRequest} request - Fastify request object
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs while creating the loan
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const currentUser = (request as any).user;

      const loan = await this.loanService.create(data, currentUser);
      return reply.status(201).send(loan);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Return a book by its ID.
   * @param {FastifyRequest} request - Fastify request object
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs while returning the book
   */
  async returnBook(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const currentUser = (request as any).user;

      const loan = await this.loanService.returnBook(id, currentUser);
      return reply.send(loan);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Get all loans for a user.
   * @param {FastifyRequest} request - Fastify request object
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs while retrieving the loans
   */
  async getUserLoans(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as any;
      const currentUser = (request as any).user;

      if (currentUser.role !== "admin" && currentUser.userId !== userId) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const loans = await this.loanService.getUserLoans(userId);
      return reply.send(loans);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }
}
