declare namespace NodeJS {
  type ProcessEnv = {
    BASE_PORT: string;
    LOAD_BALANCER_PORT: string;
    WORKER_PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
  };
}
