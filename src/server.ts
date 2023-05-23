import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import staticModule from '@fastify/static'

import { memoriesRoutes } from './routes/memoriesRoutes'
import { authRoutes } from './routes/authRoutes'
import { uploadRoutes } from './routes/uploadRoutes'
import { publicMemories } from './routes/publicMemories'
import { resolve } from 'path'

const app = fastify()

app.register(cors, {
  origin: true
})
app.register(jwt, {
  secret: String(process.env.APP_TOKEN)
})
app.register(multipart)
app.register(staticModule, {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads'
})


app.register(authRoutes)
app.register(uploadRoutes)
app.register(memoriesRoutes)
app.register(publicMemories)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀 HTTP Server Running on http://localhost:3333')
  })
