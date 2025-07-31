import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

import { config } from 'dotenv'
import { truncate } from 'fs'

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
  synchronize: false,
  logging: true,
  entities: [process.env.NODE_ENV === 'production' ? 'dist/models/Entity/*.entity.js' : 'src/models/Entity/*.entity.ts'],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migration/*.js' : 'src/migration/*.ts'],
  subscribers: [process.env.NODE_ENV === 'production' ? 'dist/subscriber/*.js' : 'src/subscriber/*.ts']
})
