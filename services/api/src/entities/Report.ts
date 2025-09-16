import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'reports' })
export class Report {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  reporterUserId!: string;

  @Index()
  @Column({ nullable: true })
  postId?: string;

  @Index()
  @Column({ nullable: true })
  commentId?: string;

  @Field()
  @Column({ type: 'text' })
  reason!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



