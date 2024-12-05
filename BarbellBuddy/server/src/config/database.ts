import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Lift } from '../models/Lift';
import { Achievement } from '../models/Achievement';
import { Friend } from '../models/Friend';
import { Program } from '../models/Program';
import { Group, UserGroup } from '../models/Group';

const sequelize = new Sequelize({
  database: 'GymDB_ver2',
  dialect: 'postgres',
  username: 'postgres',
  password: 'adminadmin',
  host: 'localhost',
  models: [User, Lift, Achievement, Friend, Program, Group, UserGroup],
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;

