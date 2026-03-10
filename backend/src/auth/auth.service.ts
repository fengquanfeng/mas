import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { userName: username },
      relations: ['roles'],
    });

    if (!user) {
      return {
        code: 401,
        data: null,
        message: '用户名或密码错误',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        code: 401,
        data: null,
        message: '用户名或密码错误',
      };
    }

    const payload = {
      username: user.userName,
      sub: user.id,
    };

    const expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRES_IN', '7d');

    const token = this.jwtService.sign(payload,{expiresIn:expiresIn as any});

    const userInfo = {
      id: user.id,
      userName: user.userName,
      name: user.name,
      avatar: user.avatar,
      mail: user.mail,
      deptId: user.deptId,
      group: user.roles.map(role => role.id),
      groupName: user.roles.map(role => role.label).join(','),
    };

    return {
      code: 200,
      data: {
        token,
        userInfo,
      },
      message: '',
    };
  }
}
