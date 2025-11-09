/* eslint-disable @typescript-eslint/no-misused-promises */
import cluster from 'cluster';
import dotenv from 'dotenv';
import os from 'os';
import { redirectRequestToService } from '../common/utils';
import { cyan, gray, yellow } from '../common/utils/style';
import { usersRouter } from '../router/usersRouter';
import { startHttpServer } from './server.utils';

dotenv.config({ quiet: true });

const { BASE_PORT, LOAD_BALANCER_PORT } = process.env;
const hostname = 'localhost';
const basePort = Number(BASE_PORT);
const balancerPort = Number(LOAD_BALANCER_PORT);
const workersCount = os.availableParallelism() - 1;
let currentWorkerId = 0;

export const balancerFlow = async (): Promise<void> => {
  await startHttpServer({ port: basePort }, usersRouter);

  Array.from({ length: workersCount }).forEach((_, i) =>
    cluster.fork({ WORKER_PORT: balancerPort + i + 1 }),
  );
  await startHttpServer({ port: balancerPort }, async (req, resp) => {
    currentWorkerId = (currentWorkerId % workersCount) + 1;
    const currentWorkerPort = balancerPort + currentWorkerId;

    console.log(gray(`Redirect request to http://${hostname}[:${currentWorkerPort}]`));
    await redirectRequestToService(req, resp, currentWorkerPort);
  });
  console.clear();
  console.log(cyan(`\n🚀 Balancer running at http://${hostname}[:${balancerPort}]`));
  console.log(yellow(`\nLaunch ${workersCount} worker(s)...`));
};

export const workerFlow = async (): Promise<void> => {
  const port = Number(process.env.WORKER_PORT);
  await startHttpServer({ port }, async (req, resp) => {
    await redirectRequestToService(req, resp, basePort);
  });
  console.log(`Worker running at http://${hostname}:${port}`);
};
