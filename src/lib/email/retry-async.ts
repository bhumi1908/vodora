const DEFAULT_RETRY_DELAY_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type RetryAsyncOptions = {
  attempts?: number;
  delayMs?: number;
  label?: string;
};

export async function retryAsync(
  operation: () => Promise<void>,
  options: RetryAsyncOptions = {},
): Promise<{ success: true } | { success: false; error: string }> {
  const attempts = options.attempts ?? 2;
  const delayMs = options.delayMs ?? DEFAULT_RETRY_DELAY_MS;
  const label = options.label ?? "operation";

  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await operation();
      return { success: true };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "An unexpected error occurred.";

      if (attempt < attempts) {
        console.warn(
          `${label} failed (attempt ${attempt}/${attempts}), retrying in ${delayMs}ms:`,
          lastError,
        );
        await sleep(delayMs);
      }
    }
  }

  console.error(`${label} failed after ${attempts} attempt(s):`, lastError);
  return { success: false, error: lastError };
}
