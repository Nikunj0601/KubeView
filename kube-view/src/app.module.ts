import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { GithubModule } from './github/github.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { JwtStrategy } from './auth/jwt.strategy';
import { K8sModule } from './k8s/k8s.module';
import { ApiKeyStrategy } from './auth/apiKey.strategy';
import { ApiKeyAuthGuard } from './auth/apiKey-auth.guard';
import { CombinedAuthGuard } from './auth/combined-auth.gaurd';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'sqlite',
          database: process.env.SQLITE_DATABASE_PATH,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    GithubModule,
    UserModule,
    K8sModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    ApiKeyStrategy,
    ApiKeyAuthGuard,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: CombinedAuthGuard,
    },
  ],
})
export class AppModule {}
