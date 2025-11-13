import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
    authorizeAdmin: (request: any, reply: any) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
