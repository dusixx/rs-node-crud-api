import cluster from 'cluster';
import { getErrorMessage } from '../common/utils';
import { red } from '../common/utils/style';
import { balancerFlow, workerFlow } from './balancer.utils';

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
