import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ShipArea } from '../ship-areas/entities/ship-area.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockProjectRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockShipAreaRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(ShipArea),
          useValue: mockShipAreaRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('servis başarıyla tamamlandı', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('tüm projeler dizi olarak dönmelidir', async () => {
      const expectedProjects = [{ id: '1', name: 'Yunustur 1 Proje' }];
      mockProjectRepository.find.mockResolvedValue(expectedProjects);

      const result = await service.findAll();

      expect(result).toEqual(expectedProjects);
      expect(mockProjectRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('var olan bir projeyi id ile bulmalıdır', async () => {
      const expectedProject = { id: '1', name: 'Yunustur 1 Proje' };
      mockProjectRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(expectedProject);
      const result = await service.findOne('1');
      expect(result).toEqual(expectedProject);
      expect(mockProjectRepository.findOne).toHaveBeenLastCalledWith({
        where: { id: '1' },
        relations: { ship: true },
      });
    });

    it('eski demo proje kodunu kayıtlı proje koduna çözmelidir', async () => {
      const expectedProject = { id: '1', projectCode: 'BLD-2026-08' };
      mockProjectRepository.findOne.mockResolvedValue(expectedProject);

      const result = await service.findOne('PRJ-084');

      expect(result).toEqual(expectedProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { projectCode: 'BLD-2026-08' },
        relations: { ship: true },
      });
    });

    it('var olmayan bir projeyi id ile bulmaya çalıştığında NotFoundException fırlatmalıdır', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('3737')).rejects.toThrow(NotFoundException);
    });
  });
});
