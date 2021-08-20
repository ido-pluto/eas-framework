import workerPool from 'workerpool';
import {find_end_of_q, find_end_of_def, find_end_block} from './index.js';

workerPool.worker({
  find_end_of_q,
  find_end_of_def,
  find_end_block
});