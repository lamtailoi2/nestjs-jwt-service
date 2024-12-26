import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
  ) {}
  async generateAccessToken(payload: Partial<User>) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AC_SECRET'),
      expiresIn: this.configService.get<string>('AC_EXP'),
    });
  }

  async generateRefreshToken(payload: Partial<User>) {
    if (payload) {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('RF_SECRET'),
        expiresIn: this.configService.get<string>('RF_EXP'),
      });
      const oldToken = await this.refreshTokenRepo.findOne({
        where: { userId: payload.id },
      });
      if (oldToken) {
        Object.assign(oldToken, token);
        await this.refreshTokenRepo.save(oldToken);
      }
      const refreshToken = this.refreshTokenRepo.create({
        token: token,
        userId: payload.id,
      });
      await this.refreshTokenRepo.save(refreshToken);
      return token;
    }
  }
  async verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('RF_SECRET'),
    });
  }

  async findRefreshToken(userId: string) {
    return this.refreshTokenRepo.findOne({ where: { userId } });
  }

  async verifyAccessToken(token: string) {
    try {
      const secret = this.configService.get<string>('AC_SECRET');
      const decoded = this.jwtService.verify(token, { secret });
      if (!decoded) {
        throw new BadRequestException('Invalid token');
      }
      return decoded;
    } catch (err: unknown) {
      console.log(err);
      throw new BadRequestException('Invalid token');
    }
  }

  async removeRefreshToken(userId: string) {
    console.log(userId);
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { userId },
    });
    if (refreshToken) {
      await this.refreshTokenRepo.remove(refreshToken);
      return;
    }
    throw new NotFoundException('Refresh token not found');
  }
}
