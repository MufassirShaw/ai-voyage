# ai-voyage

A NestJS playground for building real AI features on top of Claude (Anthropic) — not wrappers around wrappers, just direct SDK usage with patterns worth keeping.

Currently implementing two products: a **streaming chat API with citations** and a **RAG pipeline for document Q&A**. Both are now persisted in Postgres. The goal is to grow this into a full-blown application.

---

## What's here

### Chat — multi-turn streaming with citations
Sessions and their message history are persisted in Postgres, so they survive restarts. Each message can attach source documents; Claude cites specific passages in its response using Anthropic's native Citations API. Replies stream over Server-Sent Events.

### RAG — document Q&A
Upload a PDF; it's extracted, chunked, embedded with OpenAI, and stored in Postgres via **pgvector**. Questions are answered by embedding the query and retrieving the nearest chunks by cosine distance.

### Documents
A read-only resource surface over ingested documents and their processing status.

---

## Stack

- **Runtime**: Node.js, NestJS
- **LLM**: Claude via `@anthropic-ai/sdk` (`claude-sonnet-4-6` default)
- **Embeddings**: OpenAI (`text-embedding-3-small`, 1536-dim) via `openai`
- **Database**: PostgreSQL (Neon) via TypeORM — schema owned by migrations
- **Vector store**: pgvector, persistent, cosine `<=>` search backed by an HNSW index
- **Streaming**: Server-Sent Events (SSE) via NestJS `@Sse`

---

## Setup

```bash
pnpm install
```

Create a `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...

# Optional overrides
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_MAX_TOKENS=1024
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
UPLOAD_MAX_FILE_SIZE=10485760
```

The database needs permission to create the `vector` and `uuid-ossp` extensions (Neon's default role has this). Migrations run automatically on boot (`migrationsRun`), so a fresh database is provisioned on first start.

```bash
pnpm start:dev
```

---

## API

### Chat

**Create a session**
```bash
curl -X POST http://localhost:3000/chat
# { "sessionId": "3f9c...-uuid" }
```

**Send a message (SSE stream)**

The send endpoint is an SSE stream (`@Sse`, so it's a `GET`); the message is passed in the request body.
```bash
curl -N -X GET http://localhost:3000/chat/<sessionId>/send \
  -H "Content-Type: application/json" \
  -d '{ "message": "What is NestJS?" }'
```

With source documents for citations:
```bash
curl -N -X GET http://localhost:3000/chat/<sessionId>/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What does this say about dependency injection?",
    "documents": [
      { "title": "NestJS Docs", "content": "NestJS uses a module system..." }
    ]
  }'
```

**Get history**
```bash
curl http://localhost:3000/chat/<sessionId>
# { "id": "...", "createdAt": "...", "messages": [ { "role": "user", "content": ... }, ... ] }
```

**Delete a session** (cascades to its messages)
```bash
curl -X DELETE http://localhost:3000/chat/<sessionId>
# { "deleted": true }
```

---

### RAG

**Ingest a PDF** — multipart upload; the same file (by SHA-256) is de-duplicated.
```bash
curl -X POST http://localhost:3000/rag/ingest \
  -F "file=@./document.pdf" \
  -F "title=My Document"
# { "documentId": "...", "status": "completed", "chunksStored": 12 }
```

**Ask a question**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{ "question": "What does the document say about X?", "topK": 5 }'
# { "sources": [ { "title": "My Document", "chunkIndex": 0 }, ... ] }
```

> Note: `/rag/query` currently returns the matched **sources** only — feeding the retrieved chunks back to Claude for a synthesized answer is not wired yet.

---

### Documents

**List documents**
```bash
curl http://localhost:3000/documents
# { "documents": [ { "id", "title", "status", "createdAt" }, ... ] }
```

**Get one** (with processing status)
```bash
curl http://localhost:3000/documents/<uuid>
# { "id", "title", "status", "createdAt", "updatedAt" }
```

---

## Architecture

```
src/
  config/            # configuration.ts (typed env) + data-source.ts (TypeORM CLI)
  migrations/        # InitSchema (documents + pgvector), ChatPersistence (chat)
  modules/
    ai/              # AiService — Anthropic SDK wrapper (streaming + non-streaming)
    chat/            # Persisted sessions + messages, citation-aware, SSE streaming
      entities/      #   ChatSessionEntity 1─N ChatMessageEntity (content jsonb)
      repositories/
    common/          # AbstractEntity base (uuid PK)
    documents/       # DocumentEntity 1─N DocumentChunkEntity; read-only HTTP surface
      entities/ repositories/ types/
    embedding/       # EmbeddingService (OpenAI embeddings) + OpenAI provider
    rag/             # Ingestion orchestration + retrieval
      text-extraction/  #   pdf-parse
      ingestion/        #   chunk (500-char, 100 overlap) -> embed -> persist chunks
      dto/
```

- **No `DatabaseModule`** — `TypeOrmModule.forRootAsync` is configured directly in `AppModule` (`synchronize: false`, `migrationsRun: true`).
- **Repositories** inject the TypeORM `Repository` via `@InjectRepository` — no passthrough service wrappers.
- `AiService` accepts a plain string or a full `MessageParam[]`, with optional model/maxTokens overrides, so every module can drive the LLM directly.

---

## Database & migrations

Schema is owned by TypeORM migrations, not `synchronize` — pgvector's `vector` column type and the HNSW index can't be expressed through entities.

```bash
pnpm migration:run       # apply pending migrations (also runs on app boot)
pnpm migration:generate  # generate a migration from entity changes
pnpm migration:revert    # roll back the last migration
```

`InitSchema` creates the `uuid-ossp` + `vector` extensions, the `documents` / `document_chunks` tables, and the HNSW index; `ChatPersistence` creates the `chat_sessions` / `chat_messages` tables.

---

## Roadmap

- [ ] **Connect RAG to chat** — expose retrieval to Claude as a tool so the model decides when to search ingested documents (agentic RAG over the streaming chat flow)
- [ ] Synthesize answers in `/rag/query` (feed retrieved chunks back to Claude)
- [ ] Background ingestion pipeline (ingestion is currently synchronous, in-request)
- [ ] OCR for scanned PDFs + ingestion observability
- [ ] Auth layer
- [ ] Frontend
