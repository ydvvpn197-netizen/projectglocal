import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'follows' })
@Index(['followerUserId', 'followeeUserId'], { unique: true })
export class Follow {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  followerUserId!: string;

  @Index()
  @Column()
  followeeUserId!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



