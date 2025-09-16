import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'audit_logs' })
export class AuditLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  actorUserId!: string;

  @Field()
  @Column({ type: 'text' })
  action!: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  details?: unknown;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}



