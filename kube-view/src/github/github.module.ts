import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';
import { GithubController } from './github.controller';
import { ConfigModule } from '@nestjs/config';
import { K8sModule } from 'src/k8s/k8s.module';

@Module({
  imports: [HttpModule, ConfigModule, K8sModule],
  providers: [GithubService],
  exports: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
