import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'votes' })
@Index(['userId', 'postId'], { unique: true })
export class Vote {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  postId!: string;

  @Field()
  @Column({ type: 'int' })
  value!: number; // -1, 0, 1

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



