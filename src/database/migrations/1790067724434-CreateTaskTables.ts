import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskTables1790067724434 implements MigrationInterface {
    name = 'CreateTaskTables1790067724434'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

}
