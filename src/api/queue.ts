export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const queue: (() => void)[] = [];
let isProcessing = false;

async function processQueue(rateLimitMs: number) {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length) {
    const task = queue.shift();
    if (task) {
      await task(); // Wait for task to complete
      await delay(rateLimitMs); // Wait before next
    }
  }

  isProcessing = false;
}

export function enqueue<T>(
  fn: () => Promise<T>,
  rateLimitMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    processQueue(rateLimitMs);
  });
}
