import { Table, Column, Model, HasMany, BelongsToMany, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { Lift } from './Lift';
import { Achievement } from './Achievement';
import { Friend } from './Friend';
import bcrypt from 'bcrypt';
import { Group } from './Group';
import { UserGroup } from './UserGroup';
import { Chat } from './Chat';

@Table
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.SMALLINT,
    defaultValue: 0
  })
  dayCount!: number;

  @HasMany(() => Lift)
  lifts!: Lift[];

  @HasMany(() => Achievement)
  achievements!: Achievement[];

  @HasMany(() => Friend, 'userId')
  friendships!: Friend[];

  @BelongsToMany(() => User, () => Friend, 'userId', 'friendId')
  friends!: User[];

  @HasMany(() => Group, 'creatorId')
  createdGroups!: Group[];

  @BelongsToMany(() => Group, () => UserGroup)
  groups!: Group[];

  @HasMany(() => Chat, 'senderId')
  sentChats!: Chat[];

  @HasMany(() => Chat, 'receiverId')
  receivedChats!: Chat[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

