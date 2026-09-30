import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let queryBuilder: {
    addSelect: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    jwtService = { signAsync: jest.fn() };
    configService = {
      get: jest.fn((key: string) =>
        ({
          JWT_SECRET: 'access-secret',
          JWT_EXPIRATION: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        })[key],
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('logs in successfully and generates access and refresh JWTs', async () => {
    const user = {
      id: 'user-1',
      email: 'captain@example.com',
      password: await bcrypt.hash('correct-password', 10),
      role: Role.ADMIN,
    };
    queryBuilder.getOne.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(
      service.login({ email: user.email, password: 'correct-password' }),
    ).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });

    expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
      email: user.email,
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: user.id, email: user.email, role: user.role },
      { secret: 'access-secret', expiresIn: '15m' },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: user.id, email: user.email, role: user.role },
      { secret: 'refresh-secret', expiresIn: '7d' },
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        hashedRefreshToken: expect.any(String),
      }),
    );
  });

  it('rejects login when the password is invalid', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 'user-1',
      email: 'captain@example.com',
      password: await bcrypt.hash('correct-password', 10),
      role: Role.WORKER,
    });

    await expect(
      service.login({
        email: 'captain@example.com',
        password: 'incorrect-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('throws ConflictException when registering an existing email', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'existing-user',
      email: 'captain@example.com',
    });

    await expect(
      service.register({
        email: 'captain@example.com',
        password: 'password123',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'captain@example.com' },
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
