import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789634094742 implements MigrationInterface {
    name = 'InitialSchema1789634094742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "imoNumber" character varying(20), "shipType" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_749a6f66979b7db5fbde8677b3f" UNIQUE ("imoNumber"), CONSTRAINT "PK_fba257c7e5f4ff0c26afa06e9ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."projects_type_enum" AS ENUM('NEW_BUILDING', 'MAINTENANCE', 'CONVERSION')`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "type" "public"."projects_type_enum" NOT NULL DEFAULT 'NEW_BUILDING', "plannedStartDate" date, "plannedDeliveryDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ship_id" uuid, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_2924ebc5ba8b9c4657903aaaf45" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_2924ebc5ba8b9c4657903aaaf45"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_type_enum"`);
        await queryRunner.query(`DROP TABLE "ships"`);
    }

}
