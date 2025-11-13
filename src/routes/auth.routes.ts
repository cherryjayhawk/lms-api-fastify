import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createAdminSchema,
} from "../schemas/auth.schema";
import { env } from "../config/env";

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post("/register", { schema: registerSchema }, (request, reply) =>
    authController.register(request, reply)
  );

  fastify.post("/login", { schema: loginSchema }, (request, reply) =>
    authController.login(request, reply)
  );

  // Protected routes
  fastify.post(
    "/refresh",
    {
      schema: refreshTokenSchema,
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.status(401).send({ error: "Unauthorized" });
        }
      },
    },
    (request, reply) => authController.refreshToken(request, reply)
  );

  fastify.post(
    "/logout",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.status(401).send({ error: "Unauthorized" });
        }
      },
    },
    (request, reply) => authController.logout(request, reply)
  );

  fastify.get(
    "/me",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.status(401).send({ error: "Unauthorized" });
        }
      },
    },
    (request, reply) => authController.getCurrentUser(request, reply)
  );

  // Admin creation (protected with secret key)
  fastify.post(
    "/create-admin",
    {
      schema: createAdminSchema,
      preHandler: async (request, reply) => {
        const adminSecret = request.headers["x-admin-secret"];
        if (!adminSecret || adminSecret !== env.ADMIN_SECRET_KEY) {
          reply.status(401).send({ error: "Invalid or missing admin secret" });
        }
      },
    },
    (request, reply) => authController.createAdmin(request, reply)
  );
}
