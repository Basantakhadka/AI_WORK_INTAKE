import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1735400000000 implements MigrationInterface {
  name = 'InitSchema1735400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "work_items_status_enum" AS ENUM ('RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "work_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "external_id" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "status" "work_items_status_enum" NOT NULL DEFAULT 'RECEIVED',
        "category" character varying,
        "priority" character varying,
        "summary" text,
        "recommended_action" text,
        "ai_error" text,
        "ai_attempts" integer NOT NULL DEFAULT 0,
        "analysed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_work_items_external_id" UNIQUE ("external_id"),
        CONSTRAINT "PK_work_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_work_items_status" ON "work_items" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_work_items_created_at" ON "work_items" ("created_at")`);

    await queryRunner.query(
      `CREATE TYPE "work_item_status_history_from_status_enum" AS ENUM ('RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_item_status_history_to_status_enum" AS ENUM ('RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "work_item_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "work_item_id" uuid NOT NULL,
        "from_status" "work_item_status_history_from_status_enum",
        "to_status" "work_item_status_history_to_status_enum" NOT NULL,
        "reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_work_item_status_history" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_work_item_status_history_work_item_id_created_at" ON "work_item_status_history" ("work_item_id", "created_at")`,
    );

    await queryRunner.query(`
      ALTER TABLE "work_item_status_history"
      ADD CONSTRAINT "FK_work_item_status_history_work_item"
      FOREIGN KEY ("work_item_id") REFERENCES "work_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_item_status_history" DROP CONSTRAINT "FK_work_item_status_history_work_item"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_work_item_status_history_work_item_id_created_at"`);
    await queryRunner.query(`DROP TABLE "work_item_status_history"`);
    await queryRunner.query(`DROP TYPE "work_item_status_history_to_status_enum"`);
    await queryRunner.query(`DROP TYPE "work_item_status_history_from_status_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_work_items_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_work_items_status"`);
    await queryRunner.query(`DROP TABLE "work_items"`);
    await queryRunner.query(`DROP TYPE "work_items_status_enum"`);
  }
}
