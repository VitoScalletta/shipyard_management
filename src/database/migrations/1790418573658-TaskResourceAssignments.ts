import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskResourceAssignments1790418573658 implements MigrationInterface {
    name = 'TaskResourceAssignments1790418573658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "allocatedQuantity" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid, "resourceId" uuid, CONSTRAINT "PK_4cf17506ea3e24bc0136042f03f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_teams" ("task_id" uuid NOT NULL, "team_id" uuid NOT NULL, CONSTRAINT "PK_b7bb1c6365e1b6fa601d335ea52" PRIMARY KEY ("task_id", "team_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da5a226d4f7f5d3ad588304bf2" ON "task_teams"  ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7bb64be2e8bcfa2d7917356230" ON "task_teams"  ("team_id") `);
        await queryRunner.query(`ALTER TABLE "task_resources" ADD CONSTRAINT "FK_02f10dd579bb675469e345d6a80" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_resources" ADD CONSTRAINT "FK_250cdf089ab1e35b2531530f112" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_teams" ADD CONSTRAINT "FK_da5a226d4f7f5d3ad588304bf2c" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_teams" ADD CONSTRAINT "FK_7bb64be2e8bcfa2d7917356230d" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_teams" DROP CONSTRAINT "FK_7bb64be2e8bcfa2d7917356230d"`);
        await queryRunner.query(`ALTER TABLE "task_teams" DROP CONSTRAINT "FK_da5a226d4f7f5d3ad588304bf2c"`);
        await queryRunner.query(`ALTER TABLE "task_resources" DROP CONSTRAINT "FK_250cdf089ab1e35b2531530f112"`);
        await queryRunner.query(`ALTER TABLE "task_resources" DROP CONSTRAINT "FK_02f10dd579bb675469e345d6a80"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bb64be2e8bcfa2d7917356230"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da5a226d4f7f5d3ad588304bf2"`);
        await queryRunner.query(`DROP TABLE "task_teams"`);
        await queryRunner.query(`DROP TABLE "task_resources"`);
    }

}
