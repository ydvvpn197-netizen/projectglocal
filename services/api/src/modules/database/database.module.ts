import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const enable = (process.env.DB_ENABLE ?? '0') === '1';
    if (!enable) {
      return { module: DatabaseModule, global: true };
    }

    return {
      module: DatabaseModule,
      global: true,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get<string>('db.host', 'localhost'),
            port: config.get<number>('db.port', 5432),
            username: config.get<string>('db.user', 'glocal'),
            password: config.get<string>('db.password', 'glocal'),
            database: config.get<string>('db.name', 'glocal'),
            entities: [join(__dirname, '..', '..', 'entities', '*.{ts,js}')],
            synchronize: true,
            logging: false,
            autoLoadEntities: true
          })
        })
      ]
    };
  }
}



