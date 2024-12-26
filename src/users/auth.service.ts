import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TokenService } from './token.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      const salt = randomBytes(8).toString('hex');
      const hashed = (await scrypt(password, salt, 32)) as Buffer;
      const result = salt + '$' + hashed.toString('hex');
      const newUser = await this.userService.create(email, result, name);
      const payload = { email: newUser.email, id: newUser.id };
      const accessToken = await this.tokenService.generateAccessToken(payload);
      const refreshToken =
        await this.tokenService.generateRefreshToken(payload);
      return { accessToken, refreshToken };
    }
    throw new BadRequestException('User is already existed');
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const [salt, storedPassword] = user.password.split('$');
    const hashed = (await scrypt(password, salt, 32)) as Buffer;
    if (hashed.toString('hex') !== storedPassword) {
      throw new BadRequestException('Password is incorrect');
    }
    const payload = { email: user.email, id: user.id };
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  async signOut(accessToken: string): Promise<void> {
    const token = accessToken.split(' ')[1];
    const payload = await this.tokenService.verifyAccessToken(token);
    return this.tokenService.removeRefreshToken(payload.id);
  }
}
