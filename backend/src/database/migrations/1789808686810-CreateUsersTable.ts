import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1789808686810 implements MigrationInterface {
    name = 'CreateUsersTable1789808686810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MANAGER', 'ENGINEER', 'WORKER')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "phone" character varying(20), "role" "public"."users_role_enum" NOT NULL DEFAULT 'WORKER', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ship_areas" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE TYPE "public"."ship_areas_unit_enum" AS ENUM('m', 'm²', 'm³', 'kg', 'adet', 'saat', 'adam-saat')`);
        await queryRunner.query(`ALTER TABLE "ship_areas" ADD "unit" "public"."ship_areas_unit_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ship_areas" DROP COLUMN "unit"`);
        await queryRunner.query(`DROP TYPE "public"."ship_areas_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "ship_areas" ADD "unit" character varying(20)`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
