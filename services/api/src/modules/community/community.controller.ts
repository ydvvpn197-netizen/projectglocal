import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from '../../entities/Community';

@Controller('communities')
export class CommunityController {
  constructor(
    @InjectRepository(Community)
    private readonly repo: Repository<Community>
  ) {}

  @Get()
  list() {
    return this.repo.find();
  }

  @Post()
  create(@Body() body: { slug: string; name: string }) {
    const c = this.repo.create(body);
    return this.repo.save(c);
  }
}



