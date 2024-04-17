import { Controller, Get, Param } from '@nestjs/common';
import { K8sService } from './k8s.service';
import { JWTExtractData } from 'src/auth/jwt.decorator';
import { JWTExtractDto } from 'src/auth/jwt-dto.dto';

@Controller('kube')
export class K8sController {
  constructor(private readonly k8sService: K8sService) {}

  @Get('/environments/:username')
  async getNamespacesByUsername(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('username') username: string,
  ) {
    return await this.k8sService.getEnvironmentsByUser(username, userData.id);
  }

  @Get('environment/:owner/:repo/:pull')
  async getEnviornmentDetails(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull') pull: number,
  ) {
    return await this.k8sService.getEnvorinmentDetails(
      owner,
      repo,
      pull,
      userData.id,
    );
  }

  @Get('logs/:repo/:pull/:podName')
  async getPodLogs(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('podName') podName: string,
    @Param('repo') repo: string,
    @Param('pull') pull: number,
  ) {
    return await this.k8sService.getPodLogs(
      podName,
      userData.username,
      userData.id,
      repo,
      pull,
    );
  }
}
