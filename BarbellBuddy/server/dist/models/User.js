"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Lift_1 = require("./Lift");
const Achievement_1 = require("./Achievement");
const Friend_1 = require("./Friend");
const Program_1 = require("./Program");
const Group_1 = require("./Group");
const bcrypt_1 = __importDefault(require("bcrypt"));
let User = User_1 = class User extends sequelize_typescript_1.Model {
    static async hashPassword(instance) {
        if (instance.changed('password')) {
            const salt = await bcrypt_1.default.genSalt(10);
            instance.password = await bcrypt_1.default.hash(instance.password, salt);
        }
    }
    async validatePassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.SMALLINT,
        defaultValue: 0
    }),
    __metadata("design:type", Number)
], User.prototype, "dayCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], User.prototype, "registrationDate", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Lift_1.Lift),
    __metadata("design:type", Array)
], User.prototype, "lifts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Achievement_1.Achievement),
    __metadata("design:type", Array)
], User.prototype, "achievements", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => User_1, () => Friend_1.Friend, 'userId', 'friendId'),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Program_1.Program),
    __metadata("design:type", Array)
], User.prototype, "programs", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Group_1.Group, () => Group_1.UserGroup),
    __metadata("design:type", Array)
], User.prototype, "groups", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Group_1.Group, 'creatorId'),
    __metadata("design:type", Array)
], User.prototype, "createdGroups", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    sequelize_typescript_1.BeforeUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "hashPassword", null);
User = User_1 = __decorate([
    sequelize_typescript_1.Table
], User);
exports.User = User;
