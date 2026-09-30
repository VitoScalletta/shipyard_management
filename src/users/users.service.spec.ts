import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('creates a user', () => {
    expect(
      service.create({
        email: 'captain@example.com',
        password: 'password123',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).toBe('This action adds a new user');
  });

  it('returns all users', () => {
    expect(service.findAll()).toBe('This action returns all users');
  });

  it('returns one user by id', () => {
    expect(service.findOne(42)).toBe('This action returns a #42 user');
  });

  it('updates a user', () => {
    expect(service.update(42, {})).toBe('This action updates a #42 user');
  });

  it('removes a user', () => {
    expect(service.remove(42)).toBe('This action removes a #42 user');
  });
});
