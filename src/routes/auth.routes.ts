import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createAdminSchema,
  getAuthenticatedUserSchema,
  logoutSchema,
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
      /**
       * Verify the JWT token in the Authorization header.
       * If the token is invalid, send a 401 Unauthorized response.
       */
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
      schema: logoutSchema,
      /**
       * Verify the JWT token in the Authorization header.
       * If the token is invalid, send a 401 Unauthorized response.
       */
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
      schema: getAuthenticatedUserSchema,
      /**
       * Verify the JWT token in the Authorization header.
       * If the token is invalid, send a 401 Unauthorized response.
       */
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
      /**
       * Pre-handler for admin creation route.
       * Verify the admin secret key in the X-Admin-Secret header.
       * If the secret key is invalid or missing, send a 401 Unauthorized response.
       */
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
