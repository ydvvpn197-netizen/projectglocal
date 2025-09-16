import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'bookings' })
export class Booking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  eventId!: string;

  @Field()
  @Column({ type: 'int' })
  qty!: number;

  @Field()
  @Column({ type: 'text', default: 'CONFIRMED' })
  status!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



