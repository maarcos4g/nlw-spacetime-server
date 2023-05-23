import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function publicMemories(app: FastifyInstance) {
  app.get('/memories/public', async (request, reply) => {
    const memories = await prisma.memory.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 120).concat('...'),
        createdAt: memory.createdAt,
        user_name: memory.user.name,
        user_avatar: memory.user.avatarUrl,
      }
    });
  })
}