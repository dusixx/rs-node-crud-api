/* eslint-disable @typescript-eslint/no-misused-promises */
import { exec } from 'node:child_process';
import type { RequestListener } from 'node:http';
import http from 'node:http';
import { promisify } from 'node:util';
import { isNodeJSError } from '../common/utils';

const execAsync = promisify(exec);

export const killServer = async (port: number): Promise<void> => {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const matches = stdout.match(/\d+$/gm) ?? [];

      for (const pid of [...new Set(matches)]) {
        await execAsync(`taskkill /f /pid ${pid}`);
      }
    } else {
      await execAsync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch {
    // empty;
  }
};

type StartServerProps = {
  port: number;
  hostname: string;
  requestListener: RequestListener;
};

export const startServer = async (
  { port, hostname, requestListener }: StartServerProps,
  onStart?: () => void,
): Promise<void> => {
  const server = http.createServer(requestListener);

  await new Promise(resolve => {
    server.on('error', async err => {
      if (isNodeJSError(err) && err.code === 'EADDRINUSE') {
        console.log('⏳ Address in use, retrying...');
        server.close();
        await killServer(port);
        server.listen(port, hostname);
      }
    });
    server.on('listening', () => {
      resolve(null);
      onStart?.();
    });
    server.listen(port, hostname);
  });
};
