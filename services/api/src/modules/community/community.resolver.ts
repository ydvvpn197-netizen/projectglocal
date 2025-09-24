import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from '../../entities/Community';

@Resolver(() => Community)
export class CommunityResolver {
  constructor(
    @InjectRepository(Community)
    private readonly repo: Repository<Community>
  ) {}

  @Query(() => [Community])
  communities(): Promise<Community[]> {
    return this.repo.find();
  }

  @Mutation(() => Community)
  async createCommunity(
    @Args('slug') slug: string,
    @Args('name') name: string
  ): Promise<Community> {
    const c = this.repo.create({ slug, name });
    return this.repo.save(c);
  }
}



