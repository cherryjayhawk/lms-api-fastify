import { FastifyInstance } from "fastify";
import { BookController } from "../controllers/books.controller";
import {
  createBookSchema,
  deleteBookSchema,
  getBookByIdSchema,
  getBooksQuerySchema,
  updateBookSchema,
} from "../schemas/books.schema";

export default async function bookRoutes(fastify: FastifyInstance) {
  const bookController = new BookController();

  fastify.get("/", {
    schema: getBooksQuerySchema,
    handler: bookController.getAll.bind(bookController),
  });

  fastify.get("/:id", {
    schema: getBookByIdSchema,
    handler: bookController.getById.bind(bookController),
  });

  fastify.post("/", {
    schema: createBookSchema,
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.create.bind(bookController),
  });

  fastify.patch("/:id", {
    schema: updateBookSchema,
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.update.bind(bookController),
  });

  fastify.delete("/:id", {
    schema: deleteBookSchema,
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.delete.bind(bookController),
  });
}
