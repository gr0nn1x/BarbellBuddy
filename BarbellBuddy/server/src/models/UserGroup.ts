import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { User } from './User';
import { Group } from './Group';

@Table({ tableName: 'user_groups' })
export class UserGroup extends Model<UserGroup> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  groupId!: string;
}

