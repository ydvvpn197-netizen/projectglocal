import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  issueAccessToken(payload: Record<string, unknown>): string {
    return this.jwt.sign(payload, { expiresIn: '15m' });
  }

  issueRefreshToken(payload: Record<string, unknown>): string {
    return this.jwt.sign(payload, { expiresIn: '30d' });
  }
}



