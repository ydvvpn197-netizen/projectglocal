import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'comments' })
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  postId!: string;

  @Index()
  @Column()
  authorUserId!: string;

  @Index()
  @Column({ nullable: true })
  authorPseudonymId?: string | null;

  @Field()
  @Column({ type: 'text' })
  text!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}



