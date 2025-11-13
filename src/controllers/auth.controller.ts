import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const result = await this.authService.register(body);
      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const result = await this.authService.login(body, request.server.jwt.sign);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  }

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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const result = await this.authService.logout(user.userId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

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