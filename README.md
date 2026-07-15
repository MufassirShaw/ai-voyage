# ai-voyage

A NestJS playground for building real AI features on top of Claude (Anthropic) — not wrappers around wrappers, just direct SDK usage with patterns worth keeping.

Currently implementing two products: a **streaming chat API with citations** and a **RAG pipeline for document Q&A**. The goal is to grow this into a full-blown application.

---

## What's here

### Chat — multi-turn streaming with citations
Sessions that maintain message history. Each message can attach source documents; Claude will cite specific passages in its response using Anthropic's native Citations API.

### RAG — document Q&A
Ingest text documents, chunk and embed them with [Voyage AI](https://www.voyageai.com/), store in an in-memory vector store, then answer questions by retrieving the most relevant chunks and passing them to Claude as cited document blocks.

---

## Stack

- **Runtime**: Node.js, NestJS
- **LLM**: Claude via `@anthropic-ai/sdk` (`claude-sonnet-4-6` default)
- **Embeddings**: Voyage AI (`voyage-3`) via `voyageai`
- **Vector store**: In-memory cosine similarity (for now)
- **Streaming**: Server-Sent Events (SSE) via NestJS `@Sse`

---

## Setup

```bash
pnpm install
```

Create a `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...

# Optional overrides
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_MAX_TOKENS=1024
```

```bash
pnpm start:dev
```

---

## API

### Chat

**Create a session**
```bash
curl -X POST http://localhost:3000/chat/sessions
# { "sessionId": "abc-123" }
```

**Send a message (streaming)**
```bash
curl -X POST http://localhost:3000/chat/sessions/abc-123/messages \
  -H "Content-Type: application/json" \
  -d '{ "message": "What is NestJS?" }'
```

With source documents for citations:
```bash
curl -X POST http://localhost:3000/chat/sessions/abc-123/messages \
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
curl http://localhost:3000/chat/sessions/abc-123
```

**Delete session**
```bash
curl -X DELETE http://localhost:3000/chat/sessions/abc-123
```

---

### RAG

**Ingest a document**
```bash
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Long text content here..."
  }'
# { "chunksStored": 4 }
```

**List ingested documents**
```bash
curl http://localhost:3000/rag/documents
```

**Ask a question**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{ "question": "What does the document say about X?", "topK": 5 }'
# { "answer": "...", "sources": [{ "title": "...", "chunkIndex": 0 }] }
```

---

## Architecture

```
src/
  modules/
    ai/          # Base AiService — thin Anthropic SDK wrapper (streaming + non-streaming)
    chat/        # Multi-turn sessions, citation-aware message building
    rag/
      embedding/ # Voyage AI embedding calls
      ingestion/ # Chunking (500-char, 100-char overlap) + indexing
      vector-store/ # In-memory cosine similarity search
```

`AiService` accepts either a plain string or a full `MessageParam[]` array, with optional model/maxTokens overrides — so every module can drive the LLM call directly without fighting the service layer.

---

## Planned

- [ ] Persistent vector store (pgvector or Qdrant)
- [ ] File upload ingestion (PDF, markdown)
- [ ] Auth layer
- [ ] Frontend


