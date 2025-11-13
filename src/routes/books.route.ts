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
    // @ts-ignore
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.create.bind(bookController),
  });

  fastify.patch("/:id", {
    // @ts-ignore
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.update.bind(bookController),
  });

  fastify.delete("/:id", {
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.delete.bind(bookController),
  });

  fastify.post("/:id/cover", {
    preHandler: [fastify.authorizeAdmin],
    handler: bookController.uploadCover.bind(bookController),
  });
}
