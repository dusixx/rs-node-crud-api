import cluster from 'cluster';
import { showError } from '../common/utils';
import { balancerFlow, workerFlow } from './balancer.utils';

void (async (): Promise<void> => {
  try {
    if (cluster.isPrimary) {
      await balancerFlow();
    } else {
      await workerFlow();
    }
  } catch (err) {
    showError(err);
  }
})();
