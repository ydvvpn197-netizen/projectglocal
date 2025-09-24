import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostType } from '../../entities/Post';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>
  ) {}

  @Query(() => [Post])
  posts(@Args('communityId', { nullable: true }) communityId?: string) {
    if (communityId) return this.repo.find({ where: { communityId } });
    return this.repo.find();
  }

  @Mutation(() => Post)
  createPost(
    @Args('communityId') communityId: string,
    @Args('authorUserId') authorUserId: string,
    @Args('type', { type: () => PostType }) type: PostType,
    @Args('text', { nullable: true }) text?: string
  ) {
    const p = this.repo.create({ communityId, authorUserId, type, text });
    return this.repo.save(p);
  }
}



