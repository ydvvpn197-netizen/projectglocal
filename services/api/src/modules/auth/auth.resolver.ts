import { Args, Mutation, ObjectType, Field, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@ObjectType()
class AuthTokens {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthTokens)
  login(
    @Args('email') email: string,
    @Args('password') _password: string
  ): AuthTokens {
    const accessToken = this.auth.issueAccessToken({ sub: email });
    const refreshToken = this.auth.issueRefreshToken({ sub: email });
    return { accessToken, refreshToken };
  }
}



