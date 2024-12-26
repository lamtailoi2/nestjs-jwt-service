import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { SignInDTO } from './dtos/signin-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDTO } from './dtos/user.dto';
@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signUp(@Body() body: CreateUserDTO) {
    const { email, password, name } = body;
    return this.authService.signUp(email, password, name);
  }
  @UseGuards(AuthGuard)
  @Get('test')
  async test() {
    return 'Hello World';
  }

  @Post('signin')
  async signIn(@Body() body: SignInDTO) {
    const { email, password } = body;
    return this.authService.signIn(email, password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @Serialize(UserDTO)
  async me(@CurrentUser() token: string) {
    return this.usersService.getCurrentUser(token);
  }

  @Get('signout')
  async signOut(@CurrentUser() token: string) {
    return this.authService.signOut(token);
  }
}
