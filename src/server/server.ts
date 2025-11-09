/* eslint-disable @typescript-eslint/no-misused-promises */
import dotenv from 'dotenv';
import { showError } from '../common/utils';
import { cyan } from '../common/utils/style';
import { usersRouter } from '../router/usersRouter';
import { startHttpServer } from './server.utils';

dotenv.config({ quiet: true });

const { BASE_PORT } = process.env;
const port = Number(BASE_PORT);
const hostname = 'localhost';

void startHttpServer({ port }, usersRouter)
  .then(() => {
    console.clear();
    console.log(cyan(`\n🚀 Server running at http://${hostname}[:${port}]\n`));
  })
  .catch((err: unknown) => {
    showError(err);
  });
