import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubService } from 'src/github/github.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { PublicRoute } from 'src/shared/public-route';
import { JWTUser } from './jwt.decorator';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('github'))
  @PublicRoute()
  @Get('login')
  async login() {}

  @PublicRoute()
  @Get('oauth2/github')
  async getGithub() {
    return {
      clientID: this.configService.get('github.client_id'),
      scope: ['read:user', 'repo'],
    };
  }

  @Get('info')
  authUserInfo(@JWTUser() user: User) {
    return user;
  }

  @Get('callback')
  @PublicRoute()
  async callback(@Query('code') code: string) {
    if (code) {
      const accessToken = await this.githubService.getGithubAccessToken(code);
      const user = await this.githubService.getUserFromAccessToken(accessToken);
      const userExists = await this.userService.findOne({ id: user?.id });
      const newOrExistingUser = userExists || {
        id: user.id,
        email: user.email,
        username: user.login,
        apiKey: null,
      };

      if (!userExists) {
        await this.userService.insert(newOrExistingUser);
      }

      return this.authService.login(newOrExistingUser, accessToken);
    }

    throw new HttpException(
      'requires provide a `code` in query parameter',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Post('/api-key')
  async generateApiKey(@Query('username') username: string) {
    return await this.userService.generateAPIKey(username);
  }

  @Get('/generateApiKey')
  @PublicRoute()
  async generateApiKeyByCli(@Headers('github-token') githubToken: string) {
    return await this.userService.createUserAndAPIKey(githubToken);
  }

  @Get('/apiKeys')
  @PublicRoute()
  async listApiKeys(@Headers('github-token') githubToken: string) {
    return await this.userService.listApiKeys(githubToken);
  }
}
