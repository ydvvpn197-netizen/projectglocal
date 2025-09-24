import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Index({ unique: true })
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName?: string;

  @Index()
  @Column({ nullable: true })
  oauthGoogleId?: string;

  @Index()
  @Column({ nullable: true })
  oauthAppleId?: string;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Field()
  @Column({ default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ default: 0 })
  tokenVersion!: number;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}


