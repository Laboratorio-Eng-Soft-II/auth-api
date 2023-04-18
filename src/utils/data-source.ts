require('dotenv').config()
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AuthRegister } from "../entities/AuthRegister"
import config from 'config';
import { Session } from '../entities/Session';

const postgresConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>('postgresConfig');

export const AppDataSource = new DataSource({
  ...postgresConfig,
  type: 'postgres',
  synchronize: true,
  logging: false,
  entities: [AuthRegister, Session],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  subscribers: ['src/subscribers/**/*{.ts,.js}'],
});

