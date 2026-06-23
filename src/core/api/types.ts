export interface ErrorEnvelope {
  code?: string;
  message: string;
  details?: unknown;
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}

export interface Page<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}
