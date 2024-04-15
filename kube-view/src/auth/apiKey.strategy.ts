import { Strategy } from 'passport-strategy';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service'; // Import your user service here
import { User } from 'src/user/user.entity';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'apiKey') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService, // Inject your user service
  ) {
    super();
  }

  async authenticate(req: Request) {
    console.log(req.headers);

    const apiKey = req.headers['x-api-key'] as string;
    const githubAccessToken = req.headers['github-token'] as string;
    if (!apiKey) {
      return this.fail(401);
    }

    try {
      // Assuming you have a method in your UserService to get user by API key
      const user: User = await this.userService.getUserDetailsByAPIKey(apiKey);
      if (!user) {
        return this.fail(401);
      }

      const userPayload = {
        ...user,
        githubAccessToken: githubAccessToken,
      };

      this.success(userPayload);
    } catch (error) {
      return this.fail(401);
    }
  }
}
