import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'events' })
export class Event {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @Column({ type: 'timestamptz' })
  startAt!: Date;

  @Field()
  @Column({ type: 'timestamptz' })
  endAt!: Date;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  location?: unknown; // GeoJSON Point

  @Field()
  @Column({ type: 'int', default: 0 })
  capacity!: number;

  @Field()
  @Column({ type: 'int', default: 0 })
  sold!: number;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}



