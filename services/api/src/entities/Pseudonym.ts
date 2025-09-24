import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'pseudonyms' })
@Index(['userId', 'communityId'], { unique: true })
export class Pseudonym {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  communityId!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



