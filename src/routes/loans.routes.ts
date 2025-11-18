import { FastifyInstance } from "fastify";
import { LoanController } from "../controllers/loans.controller";
import {
  createLoanSchema,
  getAllLoansSchema,
  getLoanByIdSchema,
  getLoansByUserSchema,
  updateLoanSchema,
} from "../schemas/loans.schema";

export default async function loanRoutes(fastify: FastifyInstance) {
  const loanController = new LoanController();

  fastify.get("/", {
    schema: getAllLoansSchema,
    preHandler: [fastify.authenticate],
    handler: loanController.getAll.bind(loanController),
  });

  fastify.get("/:id", {
    schema: getLoanByIdSchema,
    preHandler: [fastify.authenticate],
    handler: loanController.getById.bind(loanController),
  });

  fastify.post("/", {
    schema: createLoanSchema,
    preHandler: [fastify.authenticate],
    handler: loanController.create.bind(loanController),
  });

  fastify.patch("/:id/return", {
    schema: updateLoanSchema,
    preHandler: [fastify.authenticate],
    handler: loanController.returnBook.bind(loanController),
  });

  fastify.get("/user/:userId", {
    schema: getLoansByUserSchema,
    preHandler: [fastify.authenticate],
    handler: loanController.getUserLoans.bind(loanController),
  });
}
