import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../entities/Comment';
import { CommentResolver } from './comment.resolver';
import { CommentController } from './comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentResolver],
  controllers: [CommentController]
})
export class CommentModule {}



