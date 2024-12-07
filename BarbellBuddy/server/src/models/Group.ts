import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany, DataType } from 'sequelize-typescript';
import { User } from './User';
import { UserGroup } from './UserGroup';

@Table({ tableName: 'groups' })
export class Group extends Model<Group> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  creatorId!: string;

  @BelongsTo(() => User, 'creatorId')
  creator!: User;

  @BelongsToMany(() => User, () => UserGroup)
  members!: User[];
}

