import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockProjectRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService,{
        provide: getRepositoryToken(Project),
        useValue: mockProjectRepository,
      }],
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
      const expectedProjects = [
        { id: '1', name: 'Yunustur 1 Proje' },
      ];
      mockProjectRepository.find.mockResolvedValue(expectedProjects);

      const result = await service.findAll();

      expect(result).toEqual(expectedProjects);
      expect(mockProjectRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('var olan bir projeyi id ile bulmalıdır', async () => {
      const expectedProject = { id: '1', name: 'Yunustur 1 Proje' };
      mockProjectRepository.findOne.mockResolvedValue(expectedProject);
      const result = await service.findOne('1');
      expect(result).toEqual(expectedProject);
    });

    it('var olmayan bir projeyi id ile bulmaya çalıştığında NotFoundException fırlatmalıdır', async () => {
    mockProjectRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('3737')).rejects.toThrow(NotFoundException);
  });
  });
});
