/* eslint-disable @typescript-eslint/no-misused-promises */
import { exec } from 'node:child_process';
import type {
  IncomingMessage,
  RequestListener,
  RequestOptions,
  Server,
  ServerResponse,
} from 'node:http';
import http, { request } from 'node:http';
import { promisify } from 'node:util';
import { DEF_HOSTANME, HttpStatusCode } from '../common/constants';
import { isNodeJSError } from '../common/utils';

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

type startHttpServerProps = {
  port: number;
  hostname?: string;
  requestListener?: RequestListener;
  killExists?: boolean;
  connectionTimeout?: number;
  retryDelay?: number;
};

export const startHttpServer = async (
  {
    port,
    hostname = 'localhost',
    requestListener,
    killExists = true,
    connectionTimeout = 10_000,
    retryDelay = 1_000,
  }: startHttpServerProps,
  onStart?: () => void,
): Promise<Server> => {
  let elapsed = 0;
  const server = http.createServer(requestListener);

  return await new Promise((resolve, reject) => {
    if (killExists) {
      server.on('error', async err => {
        if (isNodeJSError(err) && err.code === 'EADDRINUSE') {
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
      onStart?.();
    });
    server.listen(port, hostname);
  });
};

export const redirectRequestToService = async (
  req: IncomingMessage,
  resp: ServerResponse,
  port: number | string,
  hostname: string = DEF_HOSTANME,
): Promise<void> => {
  await new Promise((resolve, reject) => {
    const requestOptions: RequestOptions = {
      hostname,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };
    const serviceRequest = request(requestOptions, serviceResponse => {
      serviceResponse.on('end', resolve);
      serviceResponse.on('error', reject);
      resp.writeHead(
        serviceResponse.statusCode ?? HttpStatusCode.InternalServerError,
        serviceResponse.headers,
      );
      serviceResponse.pipe(resp);
    });
    serviceRequest.on('error', reject);
    req.pipe(serviceRequest);
  });
};
