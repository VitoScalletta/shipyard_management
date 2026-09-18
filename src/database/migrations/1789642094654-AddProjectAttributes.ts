import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectAttributes1789642094654 implements MigrationInterface {
    name = 'AddProjectAttributes1789642094654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "projectCode" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_14a029aa203bd962ed268ba1bcf" UNIQUE ("projectCode")`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "description" text`);
        await queryRunner.query(`CREATE TYPE "public"."projects_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "priority" "public"."projects_priority_enum" NOT NULL DEFAULT 'MEDIUM'`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "status" "public"."projects_status_enum" NOT NULL DEFAULT 'PLANNING'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "actualStartDate" date`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "actualDeliveryDate" date`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "estimatedManHours" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "actualManHours" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "progressPercentage" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "managerId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "managerId"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "progressPercentage"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "actualManHours"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "estimatedManHours"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "actualDeliveryDate"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "actualStartDate"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."projects_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "UQ_14a029aa203bd962ed268ba1bcf"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "projectCode"`);
    }

}
