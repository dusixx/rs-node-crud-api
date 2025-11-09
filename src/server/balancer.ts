import { gray, red } from './../common/utils/style';
/* eslint-disable @typescript-eslint/no-misused-promises */
import cluster from 'cluster';
import dotenv from 'dotenv';
import type { RequestListener } from 'node:http';
import os from 'os';
import { getErrorMessage } from '../common/utils';
import { cyan, yellow } from '../common/utils/style';
import { usersRouter } from '../router/usersRouter';
import { redirectRequestToService, startHttpServer } from './server.utils';

dotenv.config({ quiet: true });

const { BASE_PORT, LOAD_BALANCER_PORT } = process.env;
const hostname = 'localhost';
const basePort = Number(BASE_PORT);
const balancerPort = Number(LOAD_BALANCER_PORT);
const workersCount = os.availableParallelism() - 1;
let currentWorkerId = 0;

const balancerFlow = async (): Promise<void> => {
  await startHttpServer({ port: basePort, requestListener: usersRouter });
  console.log(cyan(`\n🚀 Main service running at http://${hostname}:${basePort}`));

  for (let i = 0; i < workersCount; i += 1) {
    cluster.fork({ WORKER_PORT: balancerPort + i + 1 });
  }
  const requestListener: RequestListener = async (req, resp) => {
    currentWorkerId = (currentWorkerId % workersCount) + 1;
    const currentWorkerPort = balancerPort + currentWorkerId;

    console.log(gray(`Redirect request to http://${hostname}:${currentWorkerPort}`));

    await redirectRequestToService(req, resp, currentWorkerPort);
  };
  await startHttpServer({ port: balancerPort, requestListener });
  console.log(cyan(`\nBalancer running at http://${hostname}:${balancerPort}`));
  console.log(yellow('Starting workers...\n'));
};

const workerFlow = async (): Promise<void> => {
  const port = Number(process.env.WORKER_PORT);
  const requestListener: RequestListener = async (req, resp) => {
    await redirectRequestToService(req, resp, basePort);
  };
  await startHttpServer({ port, requestListener });
  console.log(`Worker running at http://${hostname}:${port}`);
};

void (async (): Promise<void> => {
  try {
    if (cluster.isPrimary) {
      await balancerFlow();
    } else {
      await workerFlow();
    }
  } catch (err) {
    console.log(red('error:'), getErrorMessage(err));
  }
})();
