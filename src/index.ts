import Fastify from "fastify";
import { buildApp } from "./app";
import { env } from "./config/env";

/**
 * Starts the Fastify server
 * @returns {Promise<void>}
 */
const start = async () => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  await buildApp(fastify);
  
  fastify.get("/", async function handler(request, reply) {
    return { hello: "world" };
  });

  try {
    const port = env.PORT;
    const host = env.HOST;

    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
