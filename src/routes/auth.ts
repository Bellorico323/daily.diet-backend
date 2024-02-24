import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function authRoutes(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      name,
      email,
      password,
    })

    const expires = new Date()
    expires.setDate(expires.getDate() + 7)

    await knex('sessions').insert({
      id: sessionId,
      session_token: sessionId,
      user_id: userId,
      expires,
    })

    return reply.status(201).send()
  })

  app.post('/signin', async (request, reply) => {
    const userSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = userSchema.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (!user) {
      return reply.status(401).send({ message: 'User not found' })
    }

    if (!password || password !== user?.password) {
      return reply.status(401).send({ message: 'Incorrect password' })
    }

    const token = await knex('sessions').where('user_id', user.id).first()

    if (!token) {
      return reply.status(401).send({ message: 'User not found' })
    }

    const actualDate = new Date()

    const { sessionId } = request.cookies

    if (
      token?.expires === undefined ||
      new Date(token.expires) < actualDate ||
      !token
    ) {
      const newSessionId = randomUUID()
      const newExpiration = new Date()
      newExpiration.setDate(newExpiration.getDate() + 7)

      await knex('sessions')
        .update({
          session_token: newSessionId,
          expires: newExpiration,
        })
        .where('user_id', user.id)

      reply.cookie('sessionId', newSessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }

    if (!sessionId && new Date(token.expires) > actualDate) {
      reply.cookie('sessionId', token.session_token, {
        path: '/',
        maxAge: 7 - new Date(token.expires).getDate(),
      })
    }

    return reply.status(200).send({ message: 'User authenticated' })
  })
}
