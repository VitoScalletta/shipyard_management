import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShipAreas1789726356642 implements MigrationInterface {
    name = 'AddShipAreas1789726356642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ship_areas_type_enum" AS ENUM('DECK', 'COMPARTMENT', 'ZONE')`);
        await queryRunner.query(`CREATE TABLE "ship_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "type" "public"."ship_areas_type_enum" NOT NULL DEFAULT 'ZONE', "size" numeric(8,2), "unit" character varying(20), "ship_id" uuid, "parent_area_id" uuid, CONSTRAINT "PK_e51261efa6d7c0e18d6e129859a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ship_areas" ADD CONSTRAINT "FK_0cbc7b93cc751bc8e3b47694ca5" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ship_areas" ADD CONSTRAINT "FK_e68323c88da3ea5187a36f24467" FOREIGN KEY ("parent_area_id") REFERENCES "ship_areas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ship_areas" DROP CONSTRAINT "FK_e68323c88da3ea5187a36f24467"`);
        await queryRunner.query(`ALTER TABLE "ship_areas" DROP CONSTRAINT "FK_0cbc7b93cc751bc8e3b47694ca5"`);
        await queryRunner.query(`DROP TABLE "ship_areas"`);
        await queryRunner.query(`DROP TYPE "public"."ship_areas_type_enum"`);
    }

}
