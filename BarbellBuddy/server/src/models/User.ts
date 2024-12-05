import { Table, Column, Model, HasMany, BelongsToMany, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { Lift } from './Lift';
import { Achievement } from './Achievement';
import { Friend } from './Friend';
import { Program } from './Program';
import { Group, UserGroup } from './Group';
import bcrypt from 'bcrypt';

@Table
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
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

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  registrationDate!: Date;

  @HasMany(() => Lift)
  lifts!: Lift[];

  @HasMany(() => Achievement)
  achievements!: Achievement[];

  @BelongsToMany(() => User, () => Friend, 'userId', 'friendId')
  friends!: User[];

  @HasMany(() => Program)
  programs!: Program[];

  @BelongsToMany(() => Group, () => UserGroup)
  groups!: Group[];

  @HasMany(() => Group, 'creatorId')
  createdGroups!: Group[];

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

