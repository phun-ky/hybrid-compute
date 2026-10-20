// A hand written worker script, answering by task name, with the replies a
// worker script can get wrong
import { parentPort } from 'node:worker_threads';

parentPort?.on('message', ({ id, task, input }) => {
  const reply = (message: unknown) => parentPort?.postMessage(message);

  if (task === 'echo') reply({ id, result: input });
  else if (task === 'errorString') reply({ id, error: 'task failed' });
  else if (task === 'errorObject')
    reply({ id, error: { code: 'E_TASK', message: 'bad input' } });
  else if (task === 'errorEmpty') reply({ id, error: '' });
  else if (task === 'errorOther') reply({ id, error: 42 });
  // JSON can't hold a BigInt, so the message falls back to String()
  else if (task === 'errorBigInt') reply({ id, error: 10n });
  else if (task === 'noResult') reply({ id });
  else if (task === 'null') reply(null);
  else if (task === 'stranger') reply({ id: 9999, result: 'not yours' });
  else if (task === 'throw') throw new Error('thrown inside the worker');
  // 'hang', and anything else: never answer
});
