const queues = new Map();

const withKeyedLock = async (key, operation) => {
  const previous = queues.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const tail = previous.then(() => current);

  queues.set(key, tail);

  await previous;

  try {
    return await operation();
  } finally {
    release();
    if (queues.get(key) === tail) {
      queues.delete(key);
    }
  }
};

export default withKeyedLock;
