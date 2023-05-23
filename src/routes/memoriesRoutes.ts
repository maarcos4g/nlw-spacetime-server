import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function memoriesRoutes(app: FastifyInstance) {
  // verifica se o usuário está logado em todas as rotas
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify();
  })

  //Get All Memories
  app.get('/memories', async (request, reply) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
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
      }
    });
  })

  //Get Memory By Id
  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id:z.string().uuid().nonempty(),
    })

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      }
    })

    if (!memory.isPublic && memory.userId != request.user.sub) {
      return reply.status(401).send()
    }

    return { memory }
  })

  //Create a memory
  app.post('/memories', async (request, reply) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub
      },
    })

    return memory;

  })

  //Update a memory
  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id:z.string().uuid().nonempty(),
    })

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      }
    })

    if (memory.userId != request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      }
    })

    return memory;

  })

  //Delete a Memory
  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id:z.string().uuid().nonempty(),
    })

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      }
    })

    if (memory.userId != request.user.sub) {
      return reply.status(401).send()
    }

    await prisma.memory.delete({
      where: {
        id,
      }
    })

  })
}