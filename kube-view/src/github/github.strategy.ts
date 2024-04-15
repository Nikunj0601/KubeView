import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class DophermalGithubStrategy extends PassportStrategy(
  Strategy,
  'github',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('github.client_id'),
      clientSecret: configService.get('github.client_secret'),
      callbackURL: configService.get('github.callback_url'),
      scope: ['read:user', 'repo'],
    });
  }
}
