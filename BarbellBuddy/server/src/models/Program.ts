import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Program extends Model {
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

  @Column({
    type: DataType.JSON,
    allowNull: false
  })
  workouts!: any[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isPrivate!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;
}

