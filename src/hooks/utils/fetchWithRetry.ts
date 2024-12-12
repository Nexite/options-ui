const MAX_RETRY_ATTEMPTS = 3;

type FetchWithRetryOptions = {
  maxAttempts?: number;
  retryDelay?: number; // delay in milliseconds between retries
};

/**
 * Performs a fetch request with automatic retry functionality
 * @param input Request input (URL or Request object)
 * @param init Fetch init options
 * @param options Retry configuration options
 * @returns Promise with the fetch response
 * @throws Error if all retry attempts fail
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? MAX_RETRY_ATTEMPTS;
  const retryDelay = options.retryDelay ?? 1000;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(input, init);
      
      // Consider only successful status codes (2xx) as success
      if (response.ok) {
        return response;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      lastError = error as Error;
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw new Error(
          `Failed after ${maxAttempts} attempts. Last error: ${lastError.message}`
        );
      }

      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // This should never be reached due to the throw in the loop,
  // but TypeScript needs it for type safety
  throw lastError;
} 