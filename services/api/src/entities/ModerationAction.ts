import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'moderation_actions' })
export class ModerationAction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  moderatorUserId!: string;

  @Index()
  @Column({ nullable: true })
  postId?: string;

  @Index()
  @Column({ nullable: true })
  commentId?: string;

  @Field()
  @Column({ type: 'text' })
  action!: string; // remove/warn/timeout/ban

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



