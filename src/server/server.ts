/* eslint-disable @typescript-eslint/no-misused-promises */
import dotenv from 'dotenv';
import { styleText as style } from 'node:util';
import { DEF_SERVER_PORT } from '../common/constants';
import { getErrorMessage } from '../common/utils';
import { red } from '../common/utils/style';
import { usersRouter } from '../router/usersRouter';
import { startHttpServer } from './server.utils';

dotenv.config({ quiet: true });

const { BASE_PORT } = process.env;
const port = Number(BASE_PORT) || DEF_SERVER_PORT;
const hostname = 'localhost';

void startHttpServer({ port, hostname, requestListener: usersRouter })
  .then(() => {
    console.log(style('cyan', `\n🚀 Server running at http://${hostname}:${port}\n`));
  })
  .catch((err: unknown) => {
    console.log(red('error:'), getErrorMessage(err));
  });
