import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'secret123',
          displayName: 'Existing',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return access token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-2',
        email: 'new@example.com',
        role: 'CITIZEN',
      });
      mockJwt.sign.mockReturnValue('signed-jwt-token');

      const result = await service.register({
        email: 'new@example.com',
        password: 'secret123',
        displayName: 'New User',
      });

      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        user: { id: 'u-2', email: 'new@example.com', role: 'CITIZEN' },
      });

      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hashed = await bcrypt.hash('secret123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-3',
        email: 'user@example.com',
        password: hashed,
        role: 'CITIZEN',
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token response when credentials are valid', async () => {
      const hashed = await bcrypt.hash('secret123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-4',
        email: 'valid@example.com',
        password: hashed,
        role: 'ADMIN',
      });
      mockJwt.sign.mockReturnValue('jwt-login-token');

      const result = await service.login({
        email: 'valid@example.com',
        password: 'secret123',
      });

      expect(result).toEqual({
        accessToken: 'jwt-login-token',
        user: { id: 'u-4', email: 'valid@example.com', role: 'ADMIN' },
      });
    });
  });

  describe('getMe', () => {
    it('should return selected user fields', async () => {
      const user = {
        id: 'u-5',
        email: 'me@example.com',
        displayName: 'Me',
        role: 'DISPATCHER',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      await expect(service.getMe('u-5')).resolves.toEqual(user);
    });

    it('should throw UnauthorizedException when user is missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('unknown')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
