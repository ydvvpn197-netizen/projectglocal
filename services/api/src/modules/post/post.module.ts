import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/Post';
import { PostResolver } from './post.resolver';
import { PostController } from './post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostResolver],
  controllers: [PostController]
})
export class PostModule {}



