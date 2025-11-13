import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import bookRoutes from './routes/books.route.js';

export async function buildApp(fastify: FastifyInstance) {

  await connectDB();

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });

  //@ts-ignore
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  });

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorate('authorizeAdmin', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'admin') {
        reply.status(403).send({ error: 'Forbidden: Admin access required' });
      }
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(bookRoutes, { prefix: '/api/books' });

  return fastify;
}