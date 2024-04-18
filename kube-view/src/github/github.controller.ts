import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { request } from '@octokit/request';
import { JWTExtractDto } from 'src/auth/jwt-dto.dto';
import { JWTExtractData } from 'src/auth/jwt.decorator';
import { GithubPullRequest, GithubRepo } from './github.entity';
import { GithubService } from './github.service';
import { K8sService } from 'src/k8s/k8s.service';

@Controller('github')
export class GithubController {
  private logger = new Logger(GithubController.name);
  constructor(
    private readonly githubService: GithubService,
    private readonly k8sService: K8sService,
  ) {}

  @Get('repos')
  async getRepos(@JWTExtractData() userData: JWTExtractDto) {
    const { data } = await request(`GET /user/repos`, {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      username: userData.username,
      type: 'all',
      sort: 'created',
      per_page: 10,
    });

    return data.map((repo) => {
      const repoDto = new GithubRepo();

      repoDto.id = repo.id;
      repoDto.name = repo.name;
      repoDto.full_name = repo.full_name;
      repoDto.html_url = repo.html_url;

      return repoDto;
    });
  }

  @Get('repos/:owner/:name')
  async getRepo(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('name') repoName: string,
    @Param('owner') owner: string,
  ) {
    const { data } = await request('GET /repos/{owner}/{repo}', {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      owner,
      repo: repoName,
    });

    const repoDto = new GithubRepo();

    repoDto.id = data.id;
    repoDto.full_name = data.full_name;
    repoDto.html_url = data.html_url;
    repoDto.name = data.name;

    return repoDto;
  }

  @Get('repos/:owner/:name/pulls')
  async getRepoPullRequests(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('name') repoName: string,
    @Param('owner') owner: string,
  ) {
    const { data } = await request('GET /repos/{owner}/{repo}/pulls', {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      owner,
      repo: repoName,
      sort: 'created',
    });

    return data.map((pr) => {
      const prDto = new GithubPullRequest();

      prDto.id = pr.id;
      prDto.created_at = pr.created_at;
      prDto.html_url = pr.html_url;
      prDto.number = pr.number;
      prDto.title = pr.title;
      prDto.user = pr.user;

      return prDto;
    });
  }

  @Get('repos/:owner/:name/pulls/:pull')
  async getPullRequest(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('owner') owner: string,
    @Param('name') repo: string,
    @Param('pull') pull: number,
  ) {
    return await this.githubService.getPullRequest(
      userData.githubAccessToken,
      owner,
      repo,
      pull,
    );
  }

  @Post('repos/:owner/:name/createEnvironment/:pull')
  async createEnvironment(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('owner') owner: string,
    @Param('name') repo: string,
    @Param('pull') pull: number,
    @Body('filePaths') filePaths: [string],
  ) {
    const pullRequest: GithubPullRequest =
      await this.githubService.getPullRequest(
        userData.githubAccessToken,
        owner,
        repo,
        pull,
      );
    const contents = await this.githubService.getContentFromFiles(
      userData.githubAccessToken,
      filePaths,
      owner,
      repo,
      pullRequest.fromBranch,
    );

    const kubernetesYamlString = contents.join('\n---\n');

    const namespace = this.k8sService.createNameSpaceName(
      owner,
      repo,
      pull,
      userData.id,
    );

    const commitSha = await this.githubService.getLatestCommitShaByBranch(
      userData.githubAccessToken,
      owner,
      repo,
      pullRequest.fromBranch,
    );

    await this.k8sService.createEnvironment(
      owner,
      repo,
      pull,
      namespace,
      kubernetesYamlString,
      userData.id,
      commitSha,
    );

    const services = await this.k8sService.getPublicIpAddress(namespace);
    // const logs = await this.k8sService.getPodLogs(namespace);

    const staging_url = services.map((service) => ({
      name: service.name,
      url: `http://${service.ip}:${service.port}`,
    }));

    const commentBody = staging_url
      .map((service) => `${service.name}: ${service.url}`)
      .join(',\n');
    await this.githubService.writePullRequestCommentWithStagingUrl(
      userData.githubAccessToken,
      owner,
      repo,
      pull,
      commentBody,
    );
    return {
      staging_url: staging_url,
      // logs,
    };
  }

  @Delete('repos/:owner/:name/deleteEnviornment/:pull')
  async deleteEnvironment(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('owner') owner: string,
    @Param('name') repo: string,
    @Param('pull') pull: number,
  ) {
    await this.k8sService.deleteEnviornment(owner, repo, pull, userData.id);
  }
}
