import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'notifications' })
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Field()
  @Column({ type: 'text' })
  type!: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  payload?: unknown;

  @Field()
  @Column({ default: false })
  read!: boolean;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



