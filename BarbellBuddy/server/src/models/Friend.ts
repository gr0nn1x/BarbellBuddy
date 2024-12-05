import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Friend extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  friendId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  friendUsername!: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'friendId')
  friend!: User;
}

