// src/types/pgvector.d.ts
declare module 'pgvector' {
  export function toSql(vector: number[]): string;
  export function fromSql(value: string): number[];
}
