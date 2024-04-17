import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { GithubModule } from 'src/github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GithubModule],
  exports: [TypeOrmModule, UserService],
  providers: [UserService],
})
export class UserModule {}
