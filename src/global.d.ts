declare namespace NodeJS {
  type ProcessEnv = {
    BASE_PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
  };
}
