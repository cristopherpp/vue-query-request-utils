import { redactUrl } from './url'
import type { HttpMethod } from './types'

export class ApiError extends Error {
  readonly status: number | null
  readonly data: unknown
  readonly method: HttpMethod
  readonly url: string
  readonly cause: unknown
  constructor(details: { message: string; status: number | null; data?: unknown; method: HttpMethod; url: string; cause?: unknown }) {
    super(details.message)
    this.name = 'ApiError'
    this.status = details.status
    this.data = details.data
    this.method = details.method
    this.url = redactUrl(details.url)
    this.cause = details.cause
  }
}

export function failure(error: unknown, method: HttpMethod, url: string): ApiError {
  if (error instanceof ApiError) return error
  const cancelled = typeof error === 'object' && error !== null && 'name' in error && (error.name === 'AbortError' || error.name === 'CanceledError')
  const result = new ApiError({ message: cancelled ? 'Request cancelled' : error instanceof Error ? error.message : 'Network request failed', status: null, method, url, cause: error })
  if (cancelled) result.name = 'AbortError'
  return result
}
