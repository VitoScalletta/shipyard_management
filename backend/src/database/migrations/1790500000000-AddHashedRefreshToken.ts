import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashedRefreshToken1790500000000 implements MigrationInterface {
  name = 'AddHashedRefreshToken1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "hashedRefreshToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`,
    );
  }
}
