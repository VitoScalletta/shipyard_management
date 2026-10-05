import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipsService } from './ships.service';
import { Ship } from './entities/ship.entity';

describe('ShipsService', () => {
  let service: ShipsService;

  const mockShipRepository = {
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
        ShipsService,
        {
          provide: getRepositoryToken(Ship),
          useValue: mockShipRepository,
        },
      ],
    }).compile();

    service = module.get<ShipsService>(ShipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tanımlandı', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('tüm gemiler dizi olarak dönmelidir', async () => {
      const expectedShips = [
        { id: '1', name: 'Yunustur 1' },
        { id: '2', name: 'Yunustur 3' },
      ];
      mockShipRepository.find.mockResolvedValue(expectedShips);

      const result = await service.findAll();

      expect(result).toEqual(expectedShips);
    });
  });

  describe('findOne', () => {
    it('var olan bir gemiyi id ile bulmalıdır', async () => {
      const expectedShip = { id: '1', name: 'Yunustur 1' };
      mockShipRepository.findOne.mockResolvedValue(expectedShip);

      const result = await service.findOne('1');
      expect(result).toEqual(expectedShip);
    });

    it('var olmayan bir gemiyi id ile bulmaya çalıştığında NotFoundException fırlatmalıdır', async () => {
      mockShipRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});