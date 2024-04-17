import { Module } from '@nestjs/common';
import { K8sService } from './k8s.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environment } from './k8s.entity';
import { K8sController } from './k8s.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Environment])],
  controllers: [K8sController],
  providers: [K8sService],
  exports: [K8sService],
})
export class K8sModule {}
