import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Group extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  creatorId!: string;

  @BelongsTo(() => User, 'creatorId')
  creator!: User;

  @BelongsToMany(() => User, () => UserGroup)
  members!: User[];
}

@Table
export class UserGroup extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  groupId!: string;
}

