import { Body, Controller, Get, Post as HttpPost, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post as PostEntity } from '../../entities/Post';

@Controller('posts')
export class PostController {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repo: Repository<PostEntity>
  ) {}

  @Get()
  list(@Query('communityId') communityId?: string) {
    if (communityId) return this.repo.find({ where: { communityId } });
    return this.repo.find();
  }

  @HttpPost()
  create(@Body() body: Partial<PostEntity>) {
    const p = this.repo.create(body);
    return this.repo.save(p);
  }
}



