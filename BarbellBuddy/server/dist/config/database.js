"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("../models/User");
const Lift_1 = require("../models/Lift");
const Achievement_1 = require("../models/Achievement");
const Friend_1 = require("../models/Friend");
const Program_1 = require("../models/Program");
const Group_1 = require("../models/Group");
const sequelize = new sequelize_typescript_1.Sequelize({
    database: 'GymDB_ver2',
    dialect: 'postgres',
    username: 'postgres',
    password: 'adminadmin',
    host: 'localhost',
    models: [User_1.User, Lift_1.Lift, Achievement_1.Achievement, Friend_1.Friend, Program_1.Program, Group_1.Group, Group_1.UserGroup],
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
exports.default = sequelize;
