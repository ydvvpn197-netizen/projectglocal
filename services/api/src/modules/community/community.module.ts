import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../../entities/Community';
import { CommunityResolver } from './community.resolver';
import { CommunityController } from './community.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Community])],
  providers: [CommunityResolver],
  controllers: [CommunityController]
})
export class CommunityModule {}



