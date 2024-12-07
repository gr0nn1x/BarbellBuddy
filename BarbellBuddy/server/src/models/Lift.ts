import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'lifts' })
export class Lift extends Model<Lift> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  type!: string;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false
  })
  reps!: number;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false
  })
  sets!: number;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false
  })
  weight!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  date!: Date;

  @Column({
    type: DataType.SMALLINT,
    validate: {
      min: 1,
      max: 10
    }
  })
  rpe!: number;

  @Column(DataType.STRING)
  description!: string;

  @BelongsTo(() => User)
  user!: User;
}

