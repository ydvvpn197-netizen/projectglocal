import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  POLL = 'POLL'
}

registerEnumType(PostType, { name: 'PostType' });

@ObjectType()
@Entity({ name: 'posts' })
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  communityId!: string;

  @Index()
  @Column()
  authorUserId!: string;

  @Index()
  @Column({ nullable: true })
  authorPseudonymId?: string | null;

  @Field(() => PostType)
  @Column({ type: 'enum', enum: PostType })
  type!: PostType;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  text?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  mediaUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  linkUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  poll?: unknown;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}



