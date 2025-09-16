import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Community } from './Community';

@ObjectType()
@Entity({ name: 'community_memberships' })
@Index(['userId', 'communityId'], { unique: true })
export class CommunityMembership {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  communityId!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Community)
  community!: Community;

  @Field()
  @CreateDateColumn()
  joinedAt!: Date;
}



