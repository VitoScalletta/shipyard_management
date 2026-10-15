import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  // Veritabanını taklit eden mock objemiz
  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tanımlandı', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('tüm kullanıcıları dizi olarak dönmelidir', async () => {
      const expectedUsers = [
        { id: '1', email: 'emre@shipyard.com', firstName: 'Emre' },
      ];
      mockUserRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('var olan bir kullanıcıyı id ile dönmelidir', async () => {
      const expectedUser = {
        id: '1',
        email: 'emre@shipyard.com',
        firstName: 'Emre',
      };
      mockUserRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne('1');
      expect(result).toEqual(expectedUser);
    });

    it('var olmayan bir kullanıcıyı bulmaya çalıştığında NotFoundException fırlatmalıdır', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
