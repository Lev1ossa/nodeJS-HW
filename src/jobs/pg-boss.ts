export type PgBossJob<TData> = {
  id: string;
  data: TData;
};

export type PgBossLike = {
  on?(event: 'error', handler: (error: Error) => void): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  createQueue?(name: string): Promise<unknown>;
  work<TData>(
    name: string,
    handler: (jobs: PgBossJob<TData>[]) => Promise<unknown> | unknown
  ): Promise<unknown>;
  schedule(
    name: string,
    cron: string,
    data?: Record<string, unknown> | null,
    options?: Record<string, unknown>
  ): Promise<unknown>;
  send(
    name: string,
    data?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<string | null>;
};

export async function createPgBoss(connectionString = process.env.DATABASE_URL): Promise<PgBossLike> {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to start background jobs');
  }

  const pgBossModule = await import('pg-boss');
  const PgBoss = (pgBossModule as any).PgBoss ?? (pgBossModule as any).default;

  return new PgBoss(connectionString) as PgBossLike;
}
