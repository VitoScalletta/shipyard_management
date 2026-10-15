import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'secret';
        case 'JWT_EXPIRATION':
          return '15m';
        case 'JWT_REFRESH_SECRET':
          return 'refresh_secret';
        case 'JWT_REFRESH_EXPIRATION':
          return '7d';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tanımlandı', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('aynı email varsa ConflictException fırlatmalıdır', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: 'test@test.com' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: '123',
          firstName: 'Test',
          lastName: 'Kullanici',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('başarılı kayıtta tokenleri dönmelidir', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const mockUser = { id: '1', email: 'test@test.com', role: 'user' };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock_token');

      const result = await service.register({
        email: 'test@test.com',
        password: '123',
        firstName: 'Test',
        lastName: 'Kullanici',
      });

      expect(result).toEqual({
        access_token: 'mock_token',
        refresh_token: 'mock_token',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('kullanıcı bulunamazsa UnauthorizedException fırlatmalıdır', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('şifre hatalıysa UnauthorizedException fırlatmalıdır', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('başarılı girişte tokenleri dönmelidir', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
        role: 'user',
      };
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh_token');

      const result = await service.login({
        email: 'test@test.com',
        password: '123',
      });

      expect(result).toEqual({
        access_token: 'mock_token',
        refresh_token: 'mock_token',
      });
    });
  });

  describe('logout', () => {
    it('çıkış yapıldığında veritabanındaki refresh tokeni temizlemelidir', async () => {
      await service.logout('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        hashedRefreshToken: null,
      });
    });
  });

  describe('refreshTokens', () => {
    it('kullanıcı veya token yoksa ForbiddenException fırlatmalıdır', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.refreshTokens('1', 'token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refresh token eşleşmezse ForbiddenException fırlatmalıdır', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: '1',
        hashedRefreshToken: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens('1', 'wrong_token')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
