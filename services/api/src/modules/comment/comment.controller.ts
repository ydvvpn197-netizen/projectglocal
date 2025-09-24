import { Body, Controller, Get, Post as HttpPost, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/Comment';

@Controller('comments')
export class CommentController {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>
  ) {}

  @Get()
  list(@Query('postId') postId: string) {
    return this.repo.find({ where: { postId } });
  }

  @HttpPost()
  create(@Body() body: Partial<Comment>) {
    const c = this.repo.create(body);
    return this.repo.save(c);
  }
}



