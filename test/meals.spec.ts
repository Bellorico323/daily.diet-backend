import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to list all meals', async () => {
    const login = await request(app.server).post('/auth/signup').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'john123',
    })

    const cookies = login.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Pizza',
      meal_hour: '2024-02-19  15:30:43',
      type: 'inDiet',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Jantar',
        description: 'Pizza',
        meal_hour: '2024-02-19  15:30:43',
        type: 'inDiet',
      }),
    ])
  })
})
