/**
 * Configuration for webhook retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelayMs?: number
  /** Timeout for each request in milliseconds (default: 30000) */
  timeoutMs?: number
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  timeoutMs: 30000,
}

/**
 * Error class for webhook failures that exhausted all retry attempts
 */
export class WebhookRetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error | null
  ) {
    super(message)
    this.name = 'WebhookRetryError'
  }
}

/**
 * Trigger a webhook with exponential backoff retry logic
 *
 * @param url - The webhook URL to call
 * @param formData - The FormData payload to send
 * @param headers - Additional headers (e.g., auth secrets)
 * @param config - Retry configuration options
 * @returns Promise that resolves when webhook succeeds
 * @throws WebhookRetryError if all retry attempts fail
 */
export async function triggerWebhookWithRetry(
  url: string,
  formData: FormData,
  headers: Record<string, string> = {},
  config: RetryConfig = {}
): Promise<Response> {
  const { maxRetries, initialDelayMs, timeoutMs } = { ...DEFAULT_CONFIG, ...config }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(timeoutMs),
      })

      // Success (2xx status)
      if (response.ok) {
        return response
      }

      // Non-retryable client errors (4xx except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Server errors (5xx) and rate limiting (429) are retryable
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // AbortError from timeout is retryable
      // Other network errors are retryable
    }

    // If not the last attempt, wait with exponential backoff
    if (attempt < maxRetries) {
      const delayMs = initialDelayMs * Math.pow(2, attempt)
      // Add jitter (0-25% of delay) to prevent thundering herd
      const jitter = Math.random() * delayMs * 0.25
      await new Promise((resolve) => setTimeout(resolve, delayMs + jitter))
    }
  }

  // All retries exhausted
  throw new WebhookRetryError(
    `Webhook failed after ${maxRetries + 1} attempts`,
    maxRetries + 1,
    lastError
  )
}

/**
 * Build standard n8n webhook headers
 */
export function buildWebhookHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}

  if (process.env.N8N_WEBHOOK_SECRET) {
    headers['X-Webhook-Secret'] = process.env.N8N_WEBHOOK_SECRET
  }

  return headers
}
