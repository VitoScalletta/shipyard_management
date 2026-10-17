import { AppDataSource } from '../data-source';
import { AreaType, ShipArea } from '../ship-areas/entities/ship-area.entity';
import {
  Project,
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from '../projects/entities/project.entity';
import { Ship, ShipStatus } from '../ships/entities/ship.entity';
import { DependencyType } from '../tasks/enums/dependency-type.enum';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { Task } from '../tasks/entities/task.entity';
import { MeasurementUnit } from '../common/enums/measurement-unit.enum';

type SeedTask = {
  key: string;
  name: string;
  status: TaskStatus;
  durationDays: number;
  area: ShipArea;
  isCritical: boolean;
};

async function runSeed() {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      console.log('Tersane veritabanı tohumlanıyor...');

      const upsertShip = async (data: Partial<Ship>) => {
        const existing = await manager.findOne(Ship, {
          where: { name: data.name },
        });
        return manager.save(
          Ship,
          Object.assign(existing ?? manager.create(Ship, {}), data),
        );
      };
      const upsertProject = async (
        data: Partial<Project> & { projectCode: string },
      ) => {
        const existing = await manager.findOneBy(Project, {
          projectCode: data.projectCode,
        });
        return manager.save(
          Project,
          Object.assign(existing ?? manager.create(Project, {}), data),
        );
      };
      const upsertArea = async (
        data: Partial<ShipArea> & { ship: Ship; name: string },
      ) => {
        const existing = await manager.findOne(ShipArea, {
          where: { ship: { id: data.ship.id }, name: data.name },
        });
        return manager.save(
          ShipArea,
          Object.assign(existing ?? manager.create(ShipArea, {}), data),
        );
      };

      const yildizShip = await upsertShip({
        name: 'M/V YILDIZ KURU YÜK',
        shipType: 'Kuru yük gemisi',
        status: ShipStatus.NEW_BUILDING,
        loa: 120,
      });
      const karadenizShip = await upsertShip({
        name: 'M/T KARADENİZ TANKER',
        shipType: 'Kimyasal tanker',
        status: ShipStatus.NEW_BUILDING,
      });
      const firtinaShip = await upsertShip({
        name: 'T/B FIRTINA RÖMORKÖR',
        shipType: 'Liman römorkörü',
        status: ShipStatus.IN_MAINTENANCE,
      });

      const projects = await Promise.all(
        [
          {
            name: yildizShip.name,
            projectCode: 'BLD-2026-08',
            description: '120 metre kuru yük gemisi inşa projesi',
            type: ProjectType.NEW_BUILDING,
            priority: ProjectPriority.CRITICAL,
            status: ProjectStatus.IN_PROGRESS,
            ship: yildizShip,
            plannedDeliveryDate: new Date('2026-12-15'),
            actualManHours: 18450,
            estimatedManHours: 22000,
            progressPercentage: 74,
          },
          {
            name: karadenizShip.name,
            projectCode: 'BLD-2026-12',
            description: 'Kimyasal tanker inşa projesi',
            type: ProjectType.NEW_BUILDING,
            priority: ProjectPriority.MEDIUM,
            status: ProjectStatus.IN_PROGRESS,
            ship: karadenizShip,
            plannedDeliveryDate: new Date('2027-03-20'),
            actualManHours: 9200,
            estimatedManHours: 20000,
            progressPercentage: 45,
          },
          {
            name: firtinaShip.name,
            projectCode: 'MNT-2026-03',
            description: 'Liman römorkörü bakım projesi',
            type: ProjectType.MAINTENANCE,
            priority: ProjectPriority.HIGH,
            status: ProjectStatus.IN_PROGRESS,
            ship: firtinaShip,
            plannedDeliveryDate: new Date('2026-11-05'),
            actualManHours: 1100,
            estimatedManHours: 8500,
            progressPercentage: 12,
          },
        ].map((project) => upsertProject(project)),
      );

      const mainDeck = await upsertArea({
        ship: yildizShip,
        name: 'Ana Güverte',
        type: AreaType.DECK,
        size: 2400,
        unit: MeasurementUnit.SQUARE_METER,
      });
      const lowerDeck = await upsertArea({
        ship: yildizShip,
        name: 'Alt Güverte',
        type: AreaType.DECK,
        size: 1800,
        unit: MeasurementUnit.SQUARE_METER,
      });
      const engineRoom = await upsertArea({
        ship: yildizShip,
        name: 'Makine Dairesi',
        type: AreaType.COMPARTMENT,
        size: 850,
        unit: MeasurementUnit.SQUARE_METER,
      });

      const cargoAreaA = await upsertArea({
        ship: yildizShip,
        parentArea: mainDeck,
        name: 'Kargo Bölümü A',
        type: AreaType.COMPARTMENT,
        size: 1200,
        unit: MeasurementUnit.SQUARE_METER,
      });
      const cargoAreaB = await upsertArea({
        ship: yildizShip,
        parentArea: mainDeck,
        name: 'Kargo Bölümü B',
        type: AreaType.COMPARTMENT,
        size: 1200,
        unit: MeasurementUnit.SQUARE_METER,
      });

      const rawTasks: SeedTask[] = [
        {
          key: 'T-01',
          name: 'Sac Kesim & Ön İmalat',
          status: TaskStatus.COMPLETED,
          durationDays: 5,
          area: mainDeck,
          isCritical: true,
        },
        {
          key: 'T-02',
          name: 'Omurga Blok Montajı',
          status: TaskStatus.COMPLETED,
          durationDays: 7,
          area: lowerDeck,
          isCritical: true,
        },
        {
          key: 'T-03',
          name: 'Çift Dip (Double Bottom) Kaynak',
          status: TaskStatus.COMPLETED,
          durationDays: 6,
          area: lowerDeck,
          isCritical: true,
        },
        {
          key: 'T-04',
          name: 'Makine Dairesi Ön Donatım',
          status: TaskStatus.COMPLETED,
          durationDays: 8,
          area: engineRoom,
          isCritical: true,
        },
        {
          key: 'T-05',
          name: 'Ana Makine Kreyn İndirme',
          status: TaskStatus.COMPLETED,
          durationDays: 3,
          area: engineRoom,
          isCritical: true,
        },
        {
          key: 'T-06',
          name: 'Ana Katman Epoksi & Kumlama',
          status: TaskStatus.BLOCKED,
          durationDays: 6,
          area: cargoAreaA,
          isCritical: true,
        },
        {
          key: 'T-07',
          name: 'Şaft Hattı Lazer Hizalama',
          status: TaskStatus.DELAYED,
          durationDays: 5,
          area: engineRoom,
          isCritical: true,
        },
        {
          key: 'T-08',
          name: 'Kargo Ambarı A Kapak Montajı',
          status: TaskStatus.PENDING,
          durationDays: 4,
          area: cargoAreaA,
          isCritical: true,
        },
        {
          key: 'T-09',
          name: 'Kargo Ambarı B Izgara Kaynak',
          status: TaskStatus.IN_PROGRESS,
          durationDays: 5,
          area: cargoAreaB,
          isCritical: false,
        },
        {
          key: 'T-10',
          name: 'Ana Elektrik Pano Kablolama',
          status: TaskStatus.IN_PROGRESS,
          durationDays: 7,
          area: engineRoom,
          isCritical: false,
        },
        {
          key: 'T-11',
          name: 'Yangın Devresi Borulama',
          status: TaskStatus.PENDING,
          durationDays: 4,
          area: lowerDeck,
          isCritical: false,
        },
        {
          key: 'T-12',
          name: 'Köprüüstü Navigasyon Entegrasyonu',
          status: TaskStatus.PENDING,
          durationDays: 6,
          area: mainDeck,
          isCritical: false,
        },
        {
          key: 'T-13',
          name: 'Son Kat Zehirli Boya (Antifouling)',
          status: TaskStatus.PENDING,
          durationDays: 3,
          area: cargoAreaA,
          isCritical: true,
        },
        {
          key: 'T-14',
          name: 'Liman Kabul Testleri (HAT)',
          status: TaskStatus.PENDING,
          durationDays: 4,
          area: engineRoom,
          isCritical: true,
        },
        {
          key: 'T-15',
          name: 'Deniz Tecrübesi (Sea Trial) & Teslim',
          status: TaskStatus.PENDING,
          durationDays: 3,
          area: mainDeck,
          isCritical: true,
        },
      ];

      const taskByKey = new Map<string, Task>();
      const tasks = await Promise.all(
        rawTasks.map(
          async ({ key, name, status, durationDays, area, isCritical }) => {
            const existing = await manager.findOne(Task, {
              where: {
                project: { id: projects[0].id },
                taskType: 'SEED',
                name,
              },
            });
            const task = Object.assign(existing ?? manager.create(Task, {}), {
              name,
              status,
              priority: isCritical
                ? TaskPriority.CRITICAL
                : TaskPriority.MEDIUM,
              taskType: 'SEED',
              description: `Planlanan süre: ${durationDays} gün`,
              estimatedHours: durationDays * 8,
              project: projects[0],
              ship: yildizShip,
              shipArea: area,
            });
            taskByKey.set(key, task);
            return task;
          },
        ),
      );
      await manager.save(tasks);

      const seedTaskIds = tasks.map(({ id }) => id);
      await manager
        .createQueryBuilder()
        .delete()
        .from(TaskDependency)
        .where(
          '"predecessorId" IN (:...taskIds) OR "successorId" IN (:...taskIds)',
          { taskIds: seedTaskIds },
        )
        .execute();

      const edges: Array<[string, string]> = [
        ['T-01', 'T-02'],
        ['T-02', 'T-03'],
        ['T-03', 'T-04'],
        ['T-04', 'T-05'],
        ['T-03', 'T-06'],
        ['T-06', 'T-08'],
        ['T-08', 'T-13'],
        ['T-05', 'T-07'],
        ['T-07', 'T-14'],
        ['T-13', 'T-14'],
        ['T-04', 'T-10'],
        ['T-10', 'T-12'],
        ['T-03', 'T-09'],
        ['T-09', 'T-11'],
        ['T-14', 'T-15'],
        ['T-12', 'T-15'],
      ];
      const dependencies = edges.map(([sourceKey, targetKey]) => {
        const predecessor = taskByKey.get(sourceKey);
        const successor = taskByKey.get(targetKey);
        if (!predecessor || !successor) {
          throw new Error(
            `Görev bağımlılığı için görev bulunamadı: ${sourceKey} -> ${targetKey}`,
          );
        }
        return manager.create(TaskDependency, {
          predecessor,
          successor,
          type: DependencyType.FINISH_TO_START,
        });
      });
      await manager.save(dependencies);

      console.log(
        'Tohumlama tamamlandı: 3 gemi, 3 proje, 5 gemi alanı, 15 görev ve 16 bağımlılık.',
      );
    });
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed().catch((error: unknown) => {
  console.error('Tohumlama sırasında hata oluştu:', error);
  process.exitCode = 1;
});
