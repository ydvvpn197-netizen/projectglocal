import { Query, Resolver } from '@nestjs/graphql';
import { User } from '../../entities/User';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  users(): User[] {
    return [];
  }
}



