/* eslint-disable @typescript-eslint/no-misused-promises */
import { exec } from 'node:child_process';
import type { RequestListener, Server } from 'node:http';
import http from 'node:http';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const tryKillTask = async (pid: string | number): Promise<void> => {
  try {
    await execAsync(`taskkill /f /pid ${pid}`);
  } catch {
    void 0;
  }
};

export const killServer = async (port: number): Promise<void> => {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const matches = stdout.match(/\d+$/gm) ?? [];
      const pids = [...new Set(matches)].map(Number).filter(Boolean);

      for (const pid of pids) {
        await tryKillTask(pid);
      }
    } else {
      await execAsync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch {
    void 0;
  }
};

type StartHttpServerProps = {
  port: number;
  hostname?: string;
  killExists?: boolean;
  connectionTimeout?: number;
  retryDelay?: number;
};

export const startHttpServer = async (
  {
    port,
    hostname = 'localhost',
    killExists = true,
    connectionTimeout = 10_000,
    retryDelay = 1_000,
  }: StartHttpServerProps,
  requestListener?: RequestListener,
): Promise<Server> => {
  let elapsed = 0;
  const server = http.createServer(requestListener);

  return await new Promise((resolve, reject) => {
    if (killExists) {
      server.on('error', async (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.log('⏳ Address in use, retrying...');
          await killServer(port);

          setTimeout(() => {
            server.close();

            elapsed += retryDelay;
            if (elapsed >= connectionTimeout) {
              reject(Error('time is up'));
            }
            server.listen(port, hostname);
          }, retryDelay);
        }
      });
    } else {
      server.on('error', reject);
    }
    server.on('listening', () => {
      resolve(server);
    });
    server.listen(port, hostname);
  });
};
