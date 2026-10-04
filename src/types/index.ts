// Shared TypeScript types for the RAG chatbot

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt?: Date;
}

export interface Source {
  url: string;
  title: string;
  text: string;
}

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: {
    text: string;
    source: string;
    title: string;
    chunkIndex: number;
  };
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    source: string;
    title: string;
    chunkIndex: number;
  };
}
