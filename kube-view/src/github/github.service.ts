import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { request } from '@octokit/request';
import { ConfigService } from '@nestjs/config';
import { GithubPullRequest } from './github.entity';

@Injectable()
export class GithubService {
  private logger = new Logger(GithubService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getGithubAccessToken(authorizationCode: string) {
    console.log(this.configService.get('github.client_id'));

    const { data } = await firstValueFrom(
      this.httpService.post(
        `https://github.com/login/oauth/access_token?client_id=${this.configService.get('github.client_id')}&client_secret=${this.configService.get('github.client_secret')}&code=${authorizationCode}`,
      ),
    );

    return new URLSearchParams(data as string).get('access_token');
  }

  async getUserFromAccessToken(accessToken: string) {
    console.log(accessToken);

    const { data } = await request('GET /user', {
      headers: {
        authorization: `token ${accessToken}`,
      },
    });
    // console.log(data);

    return data;
  }

  async getPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    pull: number,
  ) {
    const { data } = await request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        headers: {
          authorization: `token ${accessToken}`,
        },
        owner,
        repo,
        pull_number: pull,
      },
    );

    console.log('PR DATA ----------', data);

    const prDto = new GithubPullRequest();

    prDto.id = data.id;
    prDto.created_at = data.created_at;
    prDto.html_url = data.html_url;
    prDto.number = data.number;
    prDto.title = data.title;
    prDto.user = data.user;
    prDto.fromBranch = data.head.ref;
    prDto.toBranch = data.base.ref;

    return prDto;
  }
  async getContentFromFiles(
    accessToken: string,
    filePaths: [string],
    owner: string,
    repo: string,
    branch: string,
  ) {
    try {
      const fileContents = [];
      console.log(filePaths);
      console.log(owner, repo);

      for (const filepath of filePaths) {
        const response = await request(
          'GET /repos/{owner}/{repo}/contents/{path}?raw=true&ref={ref}',
          {
            headers: {
              authorization: `token ${accessToken}`,
              accept: 'application/vnd.github.VERSION.raw',
            },
            owner: owner,
            repo: repo,
            path: filepath,
            ref: branch,
          },
        );
        console.log('CONTENTS OF TEST BRANCH', response.data);

        fileContents.push(response.data);
      }

      return fileContents;
    } catch (e) {
      this.logger.error(`getting content of file ${filePaths}:\n${e}`);
    }
  }

  async writeReviewCommentWithStagingUrl(
    accessToken: string,
    owner: string,
    repo: string,
    pull: number,
    commentBody: string,
  ) {
    const { data } = await request(
      'POST /repos/{owner}/{repo}/pulls/{pull_number}/comments',
      {
        headers: {
          authorization: `token ${accessToken}`,
          accept: 'application/vnd.github.VERSION.raw',
        },
        owner: owner,
        repo: repo,
        pull_number: pull,
        body: commentBody,
        commit_id: 'd7a011fdad97a9dbc42730b6f35f13979dde66ec',
        path: 'container1-deployment.yaml',
        subject_type: 'file',
      },
    );
    return data;
  }
}
