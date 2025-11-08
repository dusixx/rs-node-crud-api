/* eslint-disable @typescript-eslint/no-misused-promises */
import dotenv from 'dotenv';
import http from 'node:http';
import { styleText as style } from 'node:util';
import { usersRouter } from './router/usersRouter';

dotenv.config();

const { BASE_PORT } = process.env;
const PORT = Number(BASE_PORT || 3000);
const HOSTNAME = 'localhost';

http.createServer(usersRouter).listen(PORT, HOSTNAME, () => {
  console.log(style('cyan', `\n✅ Server running at http://${HOSTNAME}:${PORT}\n`));
});
