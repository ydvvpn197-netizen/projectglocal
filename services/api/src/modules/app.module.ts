import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import configuration from '../shared/configuration';
import { HealthController } from './health/health.controller';
import { HealthResolver } from './health/health.resolver';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { CommunityModule } from './community/community.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      csrfPrevention: true
    }),
    DatabaseModule.forRoot(),
    UserModule,
    EventsModule,
    AuthModule,
    MediaModule,
    CommunityModule,
    PostModule,
    CommentModule
  ],
  controllers: [HealthController],
  providers: [HealthResolver]
})
export class AppModule {}


