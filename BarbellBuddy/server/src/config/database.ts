import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'DB5',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'adminadmin',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  models: [path.join(__dirname, '..', 'models')] // This will automatically load all models from the models directory
});

export default sequelize;

