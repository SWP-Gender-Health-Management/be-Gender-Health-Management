import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import Account from '~/models/Entity/account.entity'
import RefreshToken from '~/models/Entity/refresh_token.entity'

import { config } from 'dotenv'

config()

// console.log('Database Config:', {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   username: process.env.DB_USER,
//   database: process.env.DATABASE
// })

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: ['src/models/Entity/*.entity.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: ['src/subscriber/*.ts']
})
