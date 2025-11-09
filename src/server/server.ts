/* eslint-disable @typescript-eslint/no-misused-promises */
import dotenv from 'dotenv';
import { styleText as style } from 'node:util';
import { DEF_SERVER_PORT } from '../common/constants';
import { usersRouter } from '../router/usersRouter';
import { startServer } from './server.utils';

dotenv.config();

const { BASE_PORT } = process.env;
const port = Number(BASE_PORT || DEF_SERVER_PORT);
const hostname = 'localhost';

void startServer({ port, hostname, requestListener: usersRouter, killExists: true }, () => {
  console.log(style('cyan', `\n🚀 Server running at http://${hostname}:${port}\n`));
});
