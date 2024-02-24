import { FastifyInstance } from 'fastify'
import { userAuthentication } from '../../middlewares/user-authentication'
import { knex } from '../../database'

export async function mealsStatisticsRoutes(app: FastifyInstance) {
  app.get(
    '/resume',
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

      const allUserMeals = await knex('meals')
        .select()
        .where('user_id', user.id)

      const totalMeals = allUserMeals.length

      return { totalMeals }
    },
  )

  app.get(
    '/in-diet',
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

      const allUserMeals = await knex('meals')
        .select()
        .where('user_id', user.id)

      const filteredInDietMeals = allUserMeals.filter((meal) => {
        return meal.type === 'inDiet'
      })

      const inDietMeals = filteredInDietMeals.length

      return { inDietMeals }
    },
  )

  app.get(
    '/out-diet',
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

      const allUserMeals = await knex('meals')
        .select()
        .where('user_id', user.id)

      const filteredOutDietMeals = allUserMeals.filter((meal) => {
        return meal.type === 'outDiet'
      })

      const outDietMeals = filteredOutDietMeals.length

      return { outDietMeals }
    },
  )

  app.get(
    '/best-streak',
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

      const allUserMeals = await knex('meals')
        .select()
        .where('user_id', user.id)

      let currentStreak = 0
      let maxStreak = 0

      for (const meal of allUserMeals) {
        if (meal.type === 'inDiet') {
          currentStreak++
        } else {
          maxStreak = Math.max(maxStreak, currentStreak)

          currentStreak = 0
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak)

      return { maxStreak }
    },
  )
}
