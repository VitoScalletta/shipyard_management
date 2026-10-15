import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkforceTables1790413693570 implements MigrationInterface {
    name = 'CreateWorkforceTables1790413693570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."teams_department_enum" AS ENUM('WELDING', 'PAINTING', 'ELECTRICAL', 'MECHANICAL', 'ASSEMBLY', 'LOGISTICS')`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "department" "public"."teams_department_enum" NOT NULL, "capacity" integer NOT NULL DEFAULT '0', "leaderId" uuid, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employees_department_enum" AS ENUM('WELDING', 'PAINTING', 'ELECTRICAL', 'MECHANICAL', 'ASSEMBLY', 'LOGISTICS')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_skilllevel_enum" AS ENUM('JUNIOR', 'MID', 'SENIOR', 'EXPERT')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_shift_enum" AS ENUM('MORNING', 'EVENING', 'NIGHT')`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "department" "public"."employees_department_enum" NOT NULL, "jobPosition" character varying(100) NOT NULL, "skillLevel" "public"."employees_skilllevel_enum" NOT NULL DEFAULT 'JUNIOR', "shift" "public"."employees_shift_enum" NOT NULL DEFAULT 'MORNING', "workingHours" integer NOT NULL DEFAULT '45', "isAvailable" boolean NOT NULL DEFAULT true, "userId" uuid, "teamId" uuid, CONSTRAINT "REL_737991e10350d9626f592894ce" UNIQUE ("userId"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_6d5c85d3f2602450d1e615afae9" FOREIGN KEY ("leaderId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_737991e10350d9626f592894cef" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_66f8bf74042e2f42ded42fecf70" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_66f8bf74042e2f42ded42fecf70"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_737991e10350d9626f592894cef"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_6d5c85d3f2602450d1e615afae9"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TYPE "public"."employees_shift_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_skilllevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_department_enum"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TYPE "public"."teams_department_enum"`);
    }

}
