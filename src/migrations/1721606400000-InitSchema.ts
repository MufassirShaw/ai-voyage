import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1721606400000 implements MigrationInterface {
  name = 'InitSchema1721606400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions: uuid-ossp backs uuid_generate_v4() PK defaults; vector is pgvector.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(
      `CREATE TYPE "documents_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed')`,
    );

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "status" "documents_status_enum" NOT NULL DEFAULT 'pending',
        "contentHash" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_documents_contentHash" ON "documents" ("contentHash")`,
    );

    await queryRunner.query(`
      CREATE TABLE "document_chunks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "documentId" uuid NOT NULL,
        "chunkIndex" integer NOT NULL,
        "content" text NOT NULL,
        "embedding" vector(1536) NOT NULL,
        CONSTRAINT "PK_document_chunks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_chunks_document" FOREIGN KEY ("documentId")
          REFERENCES "documents" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_document_chunks_documentId" ON "document_chunks" ("documentId")`,
    );
    // ANN index matching the cosine `<=>` search in DocumentChunkRepository.
    await queryRunner.query(
      `CREATE INDEX "document_chunks_embedding_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "document_chunks"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TYPE "documents_status_enum"`);
    // Extensions are left installed; they may be shared by other objects.
  }
}
