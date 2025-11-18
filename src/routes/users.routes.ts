import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/users.controller";
import {
  getAllUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  deleteUserSchema,
} from "../schemas/users.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController();

  fastify.get("/", {
    preHandler: [fastify.authorizeAdmin],
    schema: getAllUsersSchema,
    handler: userController.getAll.bind(userController),
  });

  fastify.get("/:id", {
    preHandler: [fastify.authenticate],
    schema: getUserByIdSchema,
    handler: userController.getById.bind(userController),
  });

  fastify.patch("/:id", {
    preHandler: [fastify.authenticate],
    schema: updateUserSchema,
    handler: userController.update.bind(userController),
  });

  fastify.delete("/:id", {
    preHandler: [fastify.authorizeAdmin],
    schema: deleteUserSchema,
    handler: userController.delete.bind(userController),
  });
}
