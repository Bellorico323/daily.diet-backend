// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables.ts' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at: string
    }
    sessions: {
      id: string
      session_token: string
      user_id: string
      expires: Date
    }
    meals: {
      id: string
      name: string
      description: string
      type: string
      meal_hour: string
      user_id: string
    }
  }
}
