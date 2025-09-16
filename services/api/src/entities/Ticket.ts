import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'tickets' })
export class Ticket {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  bookingId!: string;

  @Field()
  @Column({ type: 'text' })
  jwtQr!: string;

  @Field()
  @Column({ default: false })
  checkedIn!: boolean;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



