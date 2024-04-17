import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { randomBytes } from 'crypto';
import { GithubService } from 'src/github/github.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly githubService: GithubService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(user: Partial<User>): Promise<User | null> {
    return this.usersRepository.findOneBy(user);
  }

  async findOneByUsername(username: string) {
    return this.usersRepository.findOneBy({ username: username });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async insert(user: User) {
    return this.usersRepository.insert(user);
  }

  async getUserDetailsByAPIKey(apiKey: string) {
    return this.usersRepository.findOneBy({ apiKey: apiKey });
  }

  async generateAPIKey(username: string) {
    const apiKey = randomBytes(32).toString('hex');
    await this.usersRepository.update({ username }, { apiKey: apiKey });
    return apiKey;
  }

  async createUserAndAPIKey(githubToken: string) {
    const user = await this.githubService.getUserFromAccessToken(githubToken);
    const createUser = new User();
    createUser.id = user.id;
    createUser.email = user.email;
    createUser.username = user.login;
    createUser.apiKey = randomBytes(32).toString('hex');
    return this.usersRepository.save(createUser);
  }

  async listApiKeys(githubToken: string) {
    const userDetails =
      await this.githubService.getUserFromAccessToken(githubToken);
    const user = await this.usersRepository.findOneBy({ id: userDetails.id });
    return user?.apiKey;
  }
}
