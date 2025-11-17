import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import staticFiles from '@fastify/static';
import path from 'path';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import bookRoutes from './routes/books.route.js';
import userRoutes from './routes/users.routes.js';
import loanRoutes from './routes/loans.routes.js';

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

  await fastify.register(staticFiles, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
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
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(loanRoutes, { prefix: '/api/loans' });

  return fastify;
}