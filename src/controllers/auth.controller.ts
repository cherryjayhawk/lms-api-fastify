import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the registration fails.
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const result = await this.authService.register(body);
      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Login an existing user
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the login fails.
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const result = await this.authService.login(body, request.server.jwt.sign);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  }

  /**
   * Create a new admin user
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the creation fails.
   */
  async createAdmin(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const result = await this.authService.createAdmin(body);
      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Refresh an expired access token
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the refresh fails.
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const body = request.body as any;
      const result = await this.authService.refreshToken(
        user.userId,
        body.refreshToken,
        request.server.jwt.sign
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  }

  /**
   * Logout the current user
   * Invalidate the refresh token and token family.
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the logout fails.
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const result = await this.authService.logout(user.userId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Get the currently authenticated user's information
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves with no value.
   * @throws {Error} - If the user is not found.
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const userData = await this.authService.getCurrentUser(user.userId);
      return reply.send(userData);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }
}