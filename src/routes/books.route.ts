import { FastifyInstance } from "fastify";
import { BookController } from "../controllers/books.controller";

export default async function bookRoutes(fastify: FastifyInstance) {
  const bookController = new BookController();

  fastify.get("/", {
    handler: bookController.getAll.bind(bookController),
  });

  fastify.get("/:id", {
    handler: bookController.getById.bind(bookController),
  });

  fastify.post("/", {
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.create.bind(bookController),
  });

  fastify.patch("/:id", {
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.update.bind(bookController),
  });

  fastify.delete("/:id", {
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.delete.bind(bookController),
  });
}
