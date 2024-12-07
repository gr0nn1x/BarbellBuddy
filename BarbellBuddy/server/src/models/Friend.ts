import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'friends' })
export class Friend extends Model<Friend> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
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

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'friendId')
  friend!: User;
}

