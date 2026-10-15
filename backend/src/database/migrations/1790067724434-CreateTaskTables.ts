import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskTables1790067724434 implements MigrationInterface {
    name = 'CreateTaskTables1790067724434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'DELAYED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_unit_enum" AS ENUM('m', 'm²', 'm³', 'kg', 'adet', 'saat', 'adam-saat')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying, "taskType" character varying(100), "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM', "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'PENDING', "startDate" TIMESTAMP, "plannedEndDate" TIMESTAMP, "actualStartDate" TIMESTAMP, "actualEndDate" TIMESTAMP, "estimatedHours" numeric(10,2), "actualHours" numeric(10,2), "quantity" numeric(10,2), "unit" "public"."tasks_unit_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectId" uuid, "shipId" uuid, "shipAreaId" uuid, CONSTRAINT "PK_tasks" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_project" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_ship" FOREIGN KEY ("shipId") REFERENCES "ships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_ship_area" FOREIGN KEY ("shipAreaId") REFERENCES "ship_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "task_assignments" ("task_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_task_assignments" PRIMARY KEY ("task_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_task_assignments_task_id" ON "task_assignments" ("task_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_assignments_user_id" ON "task_assignments" ("user_id")`);
        await queryRunner.query(`ALTER TABLE "task_assignments" ADD CONSTRAINT "FK_task_assignments_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_assignments" ADD CONSTRAINT "FK_task_assignments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`CREATE TYPE "public"."task_dependencies_type_enum" AS ENUM('FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH')`);
        await queryRunner.query(`CREATE TABLE "task_dependencies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."task_dependencies_type_enum" NOT NULL DEFAULT 'FINISH_TO_START', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "predecessorId" uuid, "successorId" uuid, CONSTRAINT "PK_e31de0e173af595a21c4ec8e48b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_dependencies" ADD CONSTRAINT "FK_53d6f4e369243018c0edffd598f" FOREIGN KEY ("predecessorId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_dependencies" ADD CONSTRAINT "FK_584037a50f296123365c527f456" FOREIGN KEY ("successorId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_dependencies" DROP CONSTRAINT "FK_584037a50f296123365c527f456"`);
        await queryRunner.query(`ALTER TABLE "task_dependencies" DROP CONSTRAINT "FK_53d6f4e369243018c0edffd598f"`);
        await queryRunner.query(`DROP TABLE "task_dependencies"`);
        await queryRunner.query(`DROP TYPE "public"."task_dependencies_type_enum"`);
        await queryRunner.query(`ALTER TABLE "task_assignments" DROP CONSTRAINT "FK_task_assignments_user"`);
        await queryRunner.query(`ALTER TABLE "task_assignments" DROP CONSTRAINT "FK_task_assignments_task"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_task_assignments_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_task_assignments_task_id"`);
        await queryRunner.query(`DROP TABLE "task_assignments"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_ship_area"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_ship"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_project"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_unit_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    }

}
