import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResourcesTable1790416051398 implements MigrationInterface {
    name = 'CreateResourcesTable1790416051398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."resources_type_enum" AS ENUM('EQUIPMENT', 'MACHINE', 'TOOl', 'MATERIAL')`);
        await queryRunner.query(`CREATE TYPE "public"."resources_status_enum" AS ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DEPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."resources_unit_enum" AS ENUM('m', 'm²', 'm³', 'kg', 'adet', 'saat', 'adam-saat')`);
        await queryRunner.query(`CREATE TABLE "resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "type" "public"."resources_type_enum" NOT NULL, "status" "public"."resources_status_enum" NOT NULL DEFAULT 'AVAILABLE', "totalQuantity" numeric(10,2) NOT NULL DEFAULT '0', "availableQuantity" numeric(10,2) NOT NULL DEFAULT '0', "unit" "public"."resources_unit_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "resources"`);
        await queryRunner.query(`DROP TYPE "public"."resources_unit_enum"`);
        await queryRunner.query(`DROP TYPE "public"."resources_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."resources_type_enum"`);
    }

}
