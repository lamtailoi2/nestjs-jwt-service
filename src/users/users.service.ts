import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { TokenService } from './token.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private tokenService: TokenService,
  ) {}
  create(email: string, password: string, name: string) {
    const user = this.userRepo.create({ email, password, name });
    return this.userRepo.save(user);
  }

  async findOne(id: string) {
    if (id) {
      const user = await this.userRepo.findOne({ where: { id } });
      return user;
    }
    throw new NotFoundException('User not found');
  }

  async findByEmail(email: string) {
    if (email) {
      const user = await this.userRepo.findOne({ where: { email } });
      return user;
    }
    throw new NotFoundException('User not found');
  }

  async getCurrentUser(accessToken: string) {
    const token = accessToken.split(' ')[1];
    const payload = (await this.tokenService.verifyAccessToken(token)) as User;
    if (payload) {
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      return user;
    }
    throw new NotFoundException('User not found');
  }
}
