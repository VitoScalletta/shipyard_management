import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShipPhysicalAttributes1789637737005 implements MigrationInterface {
    name = 'AddShipPhysicalAttributes1789637737005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ships_status_enum" AS ENUM('ACTIVE', 'NEW_BUILDING', 'IN_MAINTENANCE', 'DECOMMISSIONED')`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "status" "public"."ships_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "loa" numeric(6,2)`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "beam" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "draft" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "height" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "displacement" numeric`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "grossTonnage" numeric`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "netTonnage" integer`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "deckArea" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "ships" ADD "enclosedArea" numeric(8,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "enclosedArea"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "deckArea"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "netTonnage"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "grossTonnage"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "displacement"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "height"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "draft"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "beam"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "loa"`);
        await queryRunner.query(`ALTER TABLE "ships" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."ships_status_enum"`);
    }

}
