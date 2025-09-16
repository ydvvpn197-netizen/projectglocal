import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/Comment';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>
  ) {}

  @Query(() => [Comment])
  comments(@Args('postId') postId: string) {
    return this.repo.find({ where: { postId } });
  }

  @Mutation(() => Comment)
  createComment(
    @Args('postId') postId: string,
    @Args('authorUserId') authorUserId: string,
    @Args('text') text: string
  ) {
    const c = this.repo.create({ postId, authorUserId, text });
    return this.repo.save(c);
  }
}



