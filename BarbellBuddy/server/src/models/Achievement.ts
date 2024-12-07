import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'achievements' })
export class Achievement extends Model<Achievement> {
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
    type: DataType.SMALLINT,
    allowNull: false
  })
  achievement!: number;

  @BelongsTo(() => User)
  user!: User;
}

