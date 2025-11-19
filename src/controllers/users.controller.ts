import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/users.service"; 

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves when the reply is sent.
   * @throws {Error} - Error if there is an issue getting all users.
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAll();
      return reply.send(users);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Get a user by ID
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves when the reply is sent.
   * @throws {Error} - Error if the user is not found.
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const user = await this.userService.getById(id);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }

  /**
   * Update a user
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves when the reply is sent.
   * @throws {Error} - Error if the user is not found or if the user does not have permission to update.
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const currentUser = (request as any).user;

      if (currentUser.role !== "admin" && currentUser.userId !== id) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const data = request.body as any;
      const user = await this.userService.update(id, data);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  /**
   * Delete a user
   * @param {FastifyRequest} request - Fastify request object.
   * @param {FastifyReply} reply - Fastify reply object.
   * @returns {Promise<void>} - Promise that resolves when the reply is sent.
   * @throws {Error} - Error if the user is not found.
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      await this.userService.delete(id);
      return reply.send({ message: "User deleted successfully" });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
