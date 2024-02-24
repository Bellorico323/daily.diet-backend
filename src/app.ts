import fastify from 'fastify'
import { authRoutes } from './routes/auth'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals/meals'
import { mealsStatisticsRoutes } from './routes/meals/meals-statistics'

export const app = fastify()

app.register(cookie)

app.register(authRoutes, {
  prefix: 'auth',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(mealsStatisticsRoutes, {
  prefix: 'meals',
})
