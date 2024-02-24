import { FastifyInstance } from 'fastify'
import { userAuthentication } from '../../middlewares/user-authentication'
import { z } from 'zod'
import { knex } from '../../database'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [userAuthentication],
    },
    async (request, reply) => {
      const mealSchema = z.object({
        name: z.string(),
        description: z.string(),
        mealHour: z.string(),
        type: z.enum(['inDiet', 'outDiet']),
      })

      const { name, mealHour, description, type } = mealSchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      const userToken = await knex('sessions')
        .where('session_token', sessionId)
        .first()

      if (!userToken) {
        return reply.status(401).send({ message: 'Token not found' })
      }

      const user = await knex('users').where('id', userToken.user_id).first()

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      const newMeal = {
        id: randomUUID(),
        name,
        description,
        meal_hour: mealHour,
        type,
        user_id: user.id,
      }

      await knex('meals').insert(newMeal)

      return reply.status(201).send(newMeal)
    },
  )

  app.get(
    '/',
    {
      preHandler: [userAuthentication],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userToken = await knex('sessions')
        .where('session_token', sessionId)
        .first()

      if (!userToken) {
        return reply.status(401).send({ message: 'Token not found' })
      }

      const user = await knex('users').where('id', userToken.user_id).first()

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      const meals = await knex('meals').where('user_id', user.id).select()

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [userAuthentication],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const userToken = await knex('sessions')
        .where('session_token', sessionId)
        .first()

      if (!userToken) {
        return reply.status(401).send({ message: 'Token not found' })
      }

      const user = await knex('users').where('id', userToken.user_id).first()

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      const meals = await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .select()

      return { meals }
    },
  )

  app.put(
    '/',
    {
      preHandler: [userAuthentication],
    },
    async (request, reply) => {
      const mealSchema = z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        mealHour: z.string().optional(),
        type: z.enum(['inDiet', 'outDiet']).optional(),
      })

      const { name, mealHour, description, type, id } = mealSchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      const userToken = await knex('sessions')
        .where('session_token', sessionId)
        .first()

      if (!userToken) {
        return reply.status(401).send({ message: 'Token not found' })
      }

      const user = await knex('users').where('id', userToken.user_id).first()

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      await knex('meals')
        .update({
          id,
          name,
          meal_hour: mealHour,
          description,
          type,
        })
        .where('id', id)

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [userAuthentication],
    },
    async (request, reply) => {
      const mealSchema = z.object({
        id: z.string(),
      })

      const { id } = mealSchema.parse(request.params)

      const { sessionId } = request.cookies

      const userToken = await knex('sessions')
        .where('session_token', sessionId)
        .first()

      if (!userToken) {
        return reply.status(401).send({ message: 'Token not found' })
      }

      const user = await knex('users').where('id', userToken.user_id).first()

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      await knex('meals').delete().where('id', id)
    },
  )
}
