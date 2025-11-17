import { FastifyInstance } from "fastify";
import { LoanController } from "../controllers/loans.controller"; 

export default async function loanRoutes(fastify: FastifyInstance) {
  const loanController = new LoanController();

  fastify.get("/", {
    preHandler: [fastify.authenticate],
    handler: loanController.getAll.bind(loanController),
  });

  fastify.get("/:id", {
    preHandler: [fastify.authenticate],
    handler: loanController.getById.bind(loanController),
  });

  fastify.post("/", {
    preHandler: [fastify.authenticate],
    handler: loanController.create.bind(loanController),
  });

  fastify.patch("/:id/return", {
    preHandler: [fastify.authenticate],
    handler: loanController.returnBook.bind(loanController),
  });

  fastify.get("/user/:userId", {
    preHandler: [fastify.authenticate],
    handler: loanController.getUserLoans.bind(loanController),
  });
}
