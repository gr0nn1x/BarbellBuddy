import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Lift extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  type!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  weight!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  reps!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  sets!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  date!: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  })
  rpe!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;

  @BelongsTo(() => User)
  user!: User;
}

