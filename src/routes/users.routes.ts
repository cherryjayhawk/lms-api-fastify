import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/users.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController();

  fastify.get('/', {
    preHandler: [fastify.authorizeAdmin],
    handler: userController.getAll.bind(userController),
  });

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    handler: userController.getById.bind(userController),
  });

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    handler: userController.update.bind(userController),
  });

  fastify.delete('/:id', {
    preHandler: [fastify.authorizeAdmin],
    handler: userController.delete.bind(userController),
  });
}