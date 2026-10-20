import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { MeasurementUnit } from '../common/enums/measurement-unit.enum';
import {
  AccountStatus,
  Role,
  User,
} from '../users/entities/user.entity';
import { Department } from '../workforce/enums/department.enum';
import { Shift } from '../workforce/enums/shift.enum';
import { SkillLevel } from '../workforce/enums/skill-level.enum';
import { Employee } from '../workforce/entities/employee.entity';
import { Team } from '../workforce/entities/team.entity';
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
import { TaskResource } from '../tasks/entities/task-resource.entity';
import { ResourceStatus } from '../resources/enums/resource-status.enum';
import { ResourceType } from '../resources/enums/resource-type.enum';
import { Resource } from '../resources/entities/resource.entity';

type TaskSeed = {
  name: string;
  areaKey: string;
  status: TaskStatus;
  priority: TaskPriority;
  startOffsetDays: number;
  durationDays: number;
  estimatedHours: number;
  quantity: number;
  unit: MeasurementUnit;
  department: Department;
  includeJokey: boolean;
};

const demoUsers = [
  {
    email: 'jokey.usta@demo.shipyard.test',
    firstName: 'Jokey',
    lastName: 'Usta',
    role: Role.WORKER,
  },
  {
    email: 'selin.demir@demo.shipyard.test',
    firstName: 'Selin',
    lastName: 'Demir',
    role: Role.MANAGER,
  },
  {
    email: 'ayse.yilmaz@demo.shipyard.test',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    role: Role.ENGINEER,
  },
  {
    email: 'mert.kaya@demo.shipyard.test',
    firstName: 'Mert',
    lastName: 'Kaya',
    role: Role.ENGINEER,
  },
  {
    email: 'deniz.arslan@demo.shipyard.test',
    firstName: 'Deniz',
    lastName: 'Arslan',
    role: Role.ENGINEER,
  },
  {
    email: 'burak.celik@demo.shipyard.test',
    firstName: 'Burak',
    lastName: 'Çelik',
    role: Role.WORKER,
  },
  {
    email: 'ece.aydin@demo.shipyard.test',
    firstName: 'Ece',
    lastName: 'Aydın',
    role: Role.WORKER,
  },
  {
    email: 'can.ozkan@demo.shipyard.test',
    firstName: 'Can',
    lastName: 'Özkan',
    role: Role.WORKER,
  },
  {
    email: 'okan.sahin@demo.shipyard.test',
    firstName: 'Okan',
    lastName: 'Şahin',
    role: Role.WORKER,
  },
];

const projects = [
  {
    key: 'yildiz',
    ship: {
      name: 'M/V Yıldız',
      shipType: 'Kuru yük gemisi',
      status: ShipStatus.NEW_BUILDING,
      loa: 128.4,
      beam: 21.2,
      draft: 7.6,
      displacement: 11200,
      grossTonnage: 8600,
      netTonnage: 4200,
      deckArea: 2650,
      enclosedArea: 5100,
    },
    project: {
      name: 'M/V Yıldız Yeni İnşa',
      projectCode: 'DEMO-BLD-2601',
      description: '128 m kuru yük gemisinin yeni inşa ve donatım projesi.',
      type: ProjectType.NEW_BUILDING,
      priority: ProjectPriority.CRITICAL,
      status: ProjectStatus.IN_PROGRESS,
      plannedStartDateOffset: -45,
      plannedDeliveryDateOffset: 70,
      estimatedManHours: 24000,
      actualManHours: 12640,
      progressPercentage: 53,
    },
    areas: [
      {
        key: 'deck',
        name: 'Ana Güverte',
        type: AreaType.DECK,
        size: 2650,
        unit: MeasurementUnit.SQUARE_METER,
      },
      {
        key: 'engine',
        name: 'Makine Dairesi',
        type: AreaType.COMPARTMENT,
        size: 780,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
      {
        key: 'hold',
        name: 'Ambar 1',
        type: AreaType.COMPARTMENT,
        size: 3100,
        unit: MeasurementUnit.CUBIC_METER,
        parentKey: 'deck',
      },
      {
        key: 'bridge',
        name: 'Köprüüstü',
        type: AreaType.ZONE,
        size: 220,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
    ],
    tasks: [
      {
        name: 'Omurga bloklarının montajı',
        areaKey: 'deck',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.CRITICAL,
        startOffsetDays: -40,
        durationDays: 12,
        estimatedHours: 720,
        quantity: 18,
        unit: MeasurementUnit.PIECE,
        department: Department.ASSEMBLY,
        includeJokey: true,
      },
      {
        name: 'Ana güverte kaynak ve NDT kontrolü',
        areaKey: 'deck',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        startOffsetDays: -8,
        durationDays: 14,
        estimatedHours: 560,
        quantity: 1450,
        unit: MeasurementUnit.METER,
        department: Department.WELDING,
        includeJokey: true,
      },
      {
        name: 'Makine dairesi boru donatımı',
        areaKey: 'engine',
        status: TaskStatus.DELAYED,
        priority: TaskPriority.CRITICAL,
        startOffsetDays: -18,
        durationDays: 9,
        estimatedHours: 360,
        quantity: 820,
        unit: MeasurementUnit.METER,
        department: Department.MECHANICAL,
        includeJokey: false,
      },
      {
        name: 'Ambar kapaklarının hidrolik montajı',
        areaKey: 'hold',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        startOffsetDays: 10,
        durationDays: 8,
        estimatedHours: 240,
        quantity: 6,
        unit: MeasurementUnit.PIECE,
        department: Department.ASSEMBLY,
        includeJokey: false,
      },
      {
        name: 'Köprüüstü seyir sistemleri kabul testi',
        areaKey: 'bridge',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        startOffsetDays: 24,
        durationDays: 5,
        estimatedHours: 120,
        quantity: 1,
        unit: MeasurementUnit.PIECE,
        department: Department.ELECTRICAL,
        includeJokey: false,
      },
    ],
  },
  {
    key: 'karadeniz',
    ship: {
      name: 'M/T Karadeniz',
      shipType: 'Kimyasal tanker',
      status: ShipStatus.NEW_BUILDING,
      loa: 146.8,
      beam: 23.4,
      draft: 8.1,
      displacement: 16800,
      grossTonnage: 12900,
      netTonnage: 6800,
      deckArea: 3200,
      enclosedArea: 6400,
    },
    project: {
      name: 'M/T Karadeniz Tanker İnşası',
      projectCode: 'DEMO-BLD-2602',
      description: 'Kimyasal tanker gövde, tank ve emniyet sistemleri imalatı.',
      type: ProjectType.NEW_BUILDING,
      priority: ProjectPriority.HIGH,
      status: ProjectStatus.IN_PROGRESS,
      plannedStartDateOffset: -35,
      plannedDeliveryDateOffset: 100,
      estimatedManHours: 32000,
      actualManHours: 10800,
      progressPercentage: 34,
    },
    areas: [
      {
        key: 'deck',
        name: 'Ana Güverte',
        type: AreaType.DECK,
        size: 3200,
        unit: MeasurementUnit.SQUARE_METER,
      },
      {
        key: 'tank',
        name: 'Kimyasal Tank Bölgesi',
        type: AreaType.COMPARTMENT,
        size: 8900,
        unit: MeasurementUnit.CUBIC_METER,
        parentKey: 'deck',
      },
      {
        key: 'pump',
        name: 'Pompa Dairesi',
        type: AreaType.COMPARTMENT,
        size: 460,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
      {
        key: 'control',
        name: 'Kargo Kontrol İstasyonu',
        type: AreaType.ZONE,
        size: 160,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
    ],
    tasks: [
      {
        name: 'Kargo tankı iç yüzey hazırlığı',
        areaKey: 'tank',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        startOffsetDays: -30,
        durationDays: 10,
        estimatedHours: 440,
        quantity: 4200,
        unit: MeasurementUnit.SQUARE_METER,
        department: Department.PAINTING,
        includeJokey: false,
      },
      {
        name: 'Paslanmaz kargo hattı kaynakları',
        areaKey: 'tank',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.CRITICAL,
        startOffsetDays: -10,
        durationDays: 18,
        estimatedHours: 760,
        quantity: 980,
        unit: MeasurementUnit.METER,
        department: Department.WELDING,
        includeJokey: true,
      },
      {
        name: 'Kargo pompaları ve motorlarının hizalanması',
        areaKey: 'pump',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        startOffsetDays: -4,
        durationDays: 12,
        estimatedHours: 300,
        quantity: 8,
        unit: MeasurementUnit.PIECE,
        department: Department.MECHANICAL,
        includeJokey: false,
      },
      {
        name: 'Gaz algılama ve alarm sistemi kurulumu',
        areaKey: 'control',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        startOffsetDays: 16,
        durationDays: 7,
        estimatedHours: 210,
        quantity: 36,
        unit: MeasurementUnit.PIECE,
        department: Department.ELECTRICAL,
        includeJokey: false,
      },
      {
        name: 'Kargo sistemi liman kabul testi',
        areaKey: 'deck',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        startOffsetDays: 38,
        durationDays: 5,
        estimatedHours: 160,
        quantity: 1,
        unit: MeasurementUnit.PIECE,
        department: Department.MECHANICAL,
        includeJokey: false,
      },
    ],
  },
  {
    key: 'firtina',
    ship: {
      name: 'T/B Fırtına',
      shipType: 'Liman römorkörü',
      status: ShipStatus.IN_MAINTENANCE,
      loa: 32.6,
      beam: 11.2,
      draft: 4.7,
      displacement: 540,
      grossTonnage: 410,
      netTonnage: 130,
      deckArea: 210,
      enclosedArea: 540,
    },
    project: {
      name: 'T/B Fırtına Kapsamlı Bakım',
      projectCode: 'DEMO-MNT-2601',
      description: 'Ana makine revizyonu, gövde bakımı ve seyir testleri.',
      type: ProjectType.MAINTENANCE,
      priority: ProjectPriority.MEDIUM,
      status: ProjectStatus.IN_PROGRESS,
      plannedStartDateOffset: -20,
      plannedDeliveryDateOffset: 35,
      estimatedManHours: 6200,
      actualManHours: 2180,
      progressPercentage: 41,
    },
    areas: [
      {
        key: 'deck',
        name: 'Çalışma Güvertesi',
        type: AreaType.DECK,
        size: 210,
        unit: MeasurementUnit.SQUARE_METER,
      },
      {
        key: 'engine',
        name: 'Makine Dairesi',
        type: AreaType.COMPARTMENT,
        size: 140,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
      {
        key: 'hull',
        name: 'Gövde ve Karina',
        type: AreaType.ZONE,
        size: 720,
        unit: MeasurementUnit.SQUARE_METER,
      },
      {
        key: 'bridge',
        name: 'Köprüüstü',
        type: AreaType.COMPARTMENT,
        size: 65,
        unit: MeasurementUnit.SQUARE_METER,
        parentKey: 'deck',
      },
    ],
    tasks: [
      {
        name: 'Ana makine enjektör revizyonu',
        areaKey: 'engine',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        startOffsetDays: -18,
        durationDays: 6,
        estimatedHours: 96,
        quantity: 6,
        unit: MeasurementUnit.PIECE,
        department: Department.MECHANICAL,
        includeJokey: false,
      },
      {
        name: 'Karina raspa ve epoksi boya',
        areaKey: 'hull',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        startOffsetDays: -5,
        durationDays: 10,
        estimatedHours: 180,
        quantity: 720,
        unit: MeasurementUnit.SQUARE_METER,
        department: Department.PAINTING,
        includeJokey: true,
      },
      {
        name: 'Dümen sistemi hidrolik kaçak kontrolü',
        areaKey: 'engine',
        status: TaskStatus.DELAYED,
        priority: TaskPriority.HIGH,
        startOffsetDays: -12,
        durationDays: 5,
        estimatedHours: 60,
        quantity: 1,
        unit: MeasurementUnit.PIECE,
        department: Department.MECHANICAL,
        includeJokey: false,
      },
      {
        name: 'Köprüüstü radar kalibrasyonu',
        areaKey: 'bridge',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        startOffsetDays: 12,
        durationDays: 3,
        estimatedHours: 36,
        quantity: 2,
        unit: MeasurementUnit.PIECE,
        department: Department.ELECTRICAL,
        includeJokey: false,
      },
      {
        name: 'Römorkör deniz tecrübesi ve teslim',
        areaKey: 'deck',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        startOffsetDays: 25,
        durationDays: 2,
        estimatedHours: 32,
        quantity: 1,
        unit: MeasurementUnit.PIECE,
        department: Department.ASSEMBLY,
        includeJokey: false,
      },
    ],
  },
];

const departments = [
  Department.WELDING,
  Department.PAINTING,
  Department.ELECTRICAL,
  Department.MECHANICAL,
  Department.ASSEMBLY,
  Department.LOGISTICS,
];

const departmentNames: Record<Department, string> = {
  [Department.WELDING]: 'Kaynak',
  [Department.PAINTING]: 'Boya ve yüzey hazırlığı',
  [Department.ELECTRICAL]: 'Elektrik ve otomasyon',
  [Department.MECHANICAL]: 'Makine ve boru',
  [Department.ASSEMBLY]: 'Montaj',
  [Department.LOGISTICS]: 'Lojistik',
};

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function runSeed() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    throw new Error(
      'Bu seed mevcut kullanıcılar dışındaki tüm uygulama verilerini sıfırlayıp kurmaca demo verisi ekler. Çalıştırmak için SEED_DEMO_DATA=true ayarlayın.',
    );
  }

  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      await manager.query(`
        TRUNCATE TABLE
          "ai_training_datasets",
          "audit_logs",
          "context_snapshots",
          "employees",
          "project_analysis",
          "projects",
          "resources",
          "ship_areas",
          "ships",
          "task_assignments",
          "task_dependencies",
          "task_resources",
          "task_teams",
          "tasks",
          "teams"
        RESTART IDENTITY CASCADE
      `);

      for (const demoUser of demoUsers) {
        let user = await manager.findOneBy(User, { email: demoUser.email });
        if (!user) {
          user = manager.create(User, {
            ...demoUser,
            password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
            status: AccountStatus.ACTIVE,
          });
          user = await manager.save(User, user);
        }
      }

      const users = await manager.find(User, {
        order: { createdAt: 'ASC', id: 'ASC' },
      });
      const jokey = users.find(
        (user) => user.firstName.toLocaleLowerCase('tr') === 'jokey',
      );
      if (!jokey) {
        throw new Error('Demo personel Jokey oluşturulamadı.');
      }

      const teams = await manager.save(
        Team,
        departments.map((department) =>
          manager.create(Team, {
            name: `${departmentNames[department]} Ekibi`,
            department,
            capacity: 8,
          }),
        ),
      );
      const teamByDepartment = new Map(
        teams.map((team) => [team.department, team]),
      );
      const employees = await manager.save(
        Employee,
        users.map((user, index) => {
          const department =
            user.id === jokey.id
              ? Department.WELDING
              : departments[index % departments.length];
          const team = teamByDepartment.get(department);
          if (!team) {
            throw new Error(`Personel ekibi bulunamadı: ${department}`);
          }
          const jobPosition =
            user.role === Role.ADMIN || user.role === Role.MANAGER
              ? 'Tersane operasyon yöneticisi'
              : user.role === Role.ENGINEER
                ? `${departmentNames[department]} mühendisi`
                : `${departmentNames[department]} teknisyeni`;
          return manager.create(Employee, {
            user,
            department,
            jobPosition,
            skillLevel:
              user.role === Role.ENGINEER
                ? SkillLevel.SENIOR
                : index % 2 === 0
                  ? SkillLevel.MID
                  : SkillLevel.JUNIOR,
            shift:
              index % 3 === 0
                ? Shift.MORNING
                : index % 3 === 1
                  ? Shift.EVENING
                  : Shift.NIGHT,
            workingHours: 45,
            isAvailable: index % 7 !== 0,
            team,
          });
        }),
      );

      for (const team of teams) {
        const leader = employees.find(
          (employee) => employee.department === team.department,
        );
        if (leader) {
          team.leader = leader;
        }
      }
      await manager.save(Team, teams);

      const shipByKey = new Map<string, Ship>();
      const projectByKey = new Map<string, Project>();
      const areaByKey = new Map<string, ShipArea>();
      for (const projectSeed of projects) {
        const ship = await manager.save(
          Ship,
          manager.create(Ship, projectSeed.ship),
        );
        shipByKey.set(projectSeed.key, ship);

        const {
          plannedStartDateOffset,
          plannedDeliveryDateOffset,
          ...projectFields
        } = projectSeed.project;
        const project = await manager.save(
          Project,
          manager.create(Project, {
            ...projectFields,
            plannedStartDate: dateOffset(plannedStartDateOffset),
            actualStartDate: dateOffset(plannedStartDateOffset),
            plannedDeliveryDate: dateOffset(plannedDeliveryDateOffset),
            ship,
          }),
        );
        projectByKey.set(projectSeed.key, project);

        for (const areaSeed of projectSeed.areas) {
          const parentArea = areaSeed.parentKey
            ? areaByKey.get(`${projectSeed.key}:${areaSeed.parentKey}`)
            : undefined;
          if (areaSeed.parentKey && !parentArea) {
            throw new Error(
              `Üst gemi bölgesi bulunamadı: ${projectSeed.key}/${areaSeed.parentKey}`,
            );
          }
          const area = await manager.save(
            ShipArea,
            manager.create(ShipArea, {
              name: areaSeed.name,
              type: areaSeed.type,
              size: areaSeed.size,
              unit: areaSeed.unit,
              ship,
              project,
              parentArea,
            }),
          );
          areaByKey.set(`${projectSeed.key}:${areaSeed.key}`, area);
        }
      }

      const resources = await manager.save(
        Resource,
        [
          {
            name: 'Mobil vinç 80 ton',
            description: 'Ağır makine ve blok kaldırma için mobil vinç.',
            type: ResourceType.EQUIPMENT,
            status: ResourceStatus.AVAILABLE,
            totalQuantity: 2,
            availableQuantity: 1,
            unit: MeasurementUnit.PIECE,
          },
          {
            name: 'MIG/MAG kaynak makinesi',
            description: 'Gövde ve güverte imalatı için kaynak seti.',
            type: ResourceType.MACHINE,
            status: ResourceStatus.IN_USE,
            totalQuantity: 18,
            availableQuantity: 12,
            unit: MeasurementUnit.PIECE,
          },
          {
            name: 'Gemi sacı, 8 mm',
            description: 'Gövde ve güverte imalatında kullanılan gemi sacı.',
            type: ResourceType.MATERIAL,
            status: ResourceStatus.AVAILABLE,
            totalQuantity: 42000,
            availableQuantity: 27500,
            unit: MeasurementUnit.KILOGRAM,
          },
          {
            name: 'Deniz tipi epoksi astar',
            description: 'Gemi gövdesi için iki bileşenli epoksi astar.',
            type: ResourceType.MATERIAL,
            status: ResourceStatus.AVAILABLE,
            totalQuantity: 3200,
            availableQuantity: 2100,
            unit: MeasurementUnit.KILOGRAM,
          },
          {
            name: 'Hidrolik test pompası',
            description: 'Boru ve hidrolik hat basınç test pompası.',
            type: ResourceType.TOOL,
            status: ResourceStatus.MAINTENANCE,
            totalQuantity: 6,
            availableQuantity: 4,
            unit: MeasurementUnit.PIECE,
          },
        ].map((resource) => manager.create(Resource, resource)),
      );
      const resourceByName = new Map(
        resources.map((resource) => [resource.name, resource]),
      );

      const taskByProject = new Map<string, Task[]>();
      const allTasks: Task[] = [];
      for (const projectSeed of projects) {
        const ship = shipByKey.get(projectSeed.key);
        const project = projectByKey.get(projectSeed.key);
        if (!ship || !project) {
          throw new Error(`Gemi veya proje bulunamadı: ${projectSeed.key}`);
        }
        const projectTasks: Task[] = [];
        for (const [index, taskSeed] of projectSeed.tasks.entries()) {
          const area = areaByKey.get(`${projectSeed.key}:${taskSeed.areaKey}`);
          const team = teamByDepartment.get(taskSeed.department);
          if (!area || !team) {
            throw new Error(
              `Görev için bölge veya ekip bulunamadı: ${taskSeed.name}`,
            );
          }
          const startDate = dateOffset(taskSeed.startOffsetDays);
          const plannedEndDate = dateOffset(
            taskSeed.startOffsetDays + taskSeed.durationDays,
          );
          const assignedUsers = [
            users[index % users.length],
            ...(taskSeed.includeJokey && users[index % users.length].id !== jokey.id
              ? [jokey]
              : []),
          ];
          const estimatedHours = taskSeed.estimatedHours;
          const task = await manager.save(
            Task,
            manager.create(Task, {
              name: taskSeed.name,
              description: `${departmentNames[taskSeed.department]} ekibi tarafından yürütülür; planlanan süre ${taskSeed.durationDays} gündür.`,
              taskType: 'DEMO',
              status: taskSeed.status,
              priority: taskSeed.priority,
              startDate,
              plannedEndDate,
              actualStartDate:
                taskSeed.status === TaskStatus.PENDING ? undefined : startDate,
              actualEndDate:
                taskSeed.status === TaskStatus.COMPLETED
                  ? plannedEndDate
                  : undefined,
              estimatedHours,
              actualHours:
                taskSeed.status === TaskStatus.COMPLETED
                  ? Math.round(estimatedHours * 0.94)
                  : taskSeed.status === TaskStatus.IN_PROGRESS
                    ? Math.round(estimatedHours * 0.45)
                    : undefined,
              quantity: taskSeed.quantity,
              unit: taskSeed.unit,
              project,
              ship,
              shipArea: area,
              assignedUsers,
              assignedTeams: [team],
            }),
          );
          projectTasks.push(task);
          allTasks.push(task);
        }
        taskByProject.set(projectSeed.key, projectTasks);
      }

      const dependencies: TaskDependency[] = [];
      for (const projectKey of projectByKey.keys()) {
        const projectTasks = taskByProject.get(projectKey);
        if (!projectTasks || projectTasks.length < 5) {
          throw new Error(`Görev dizisi eksik: ${projectKey}`);
        }
        for (const [predecessorIndex, successorIndex] of [
          [0, 1],
          [1, 2],
          [1, 3],
          [3, 4],
        ]) {
          dependencies.push(
            manager.create(TaskDependency, {
              predecessor: projectTasks[predecessorIndex],
              successor: projectTasks[successorIndex],
              type: DependencyType.FINISH_TO_START,
            }),
          );
        }
      }
      await manager.save(TaskDependency, dependencies);

      const resourceAssignments = [
        [0, 'MIG/MAG kaynak makinesi', 2],
        [1, 'Gemi sacı, 8 mm', 1800],
        [2, 'Hidrolik test pompası', 1],
        [6, 'Mobil vinç 80 ton', 1],
        [7, 'Deniz tipi epoksi astar', 260],
        [10, 'Hidrolik test pompası', 1],
      ].map(([taskIndex, resourceName, quantity]) => {
        const task = allTasks[Number(taskIndex)];
        const resource = resourceByName.get(String(resourceName));
        if (!task || !resource) {
          throw new Error(`Kaynak ataması oluşturulamadı: ${resourceName}`);
        }
        return manager.create(TaskResource, {
          task,
          resource,
          allocatedQuantity: Number(quantity),
        });
      });
      await manager.save(TaskResource, resourceAssignments);

      console.log(
        `Tohumlama tamamlandı: ${users.length} kullanıcı/personel, ${projects.length} gemi, ${projects.length} proje, ${areaByKey.size} gemi bölgesi, ${allTasks.length} görev, ${dependencies.length} bağımlılık, ${teams.length} ekip ve ${resources.length} kaynak.`,
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
