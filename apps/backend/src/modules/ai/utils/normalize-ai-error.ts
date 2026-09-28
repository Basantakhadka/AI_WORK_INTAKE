/**
 * Turns any thrown value (SDK error, ZodError, timeout, etc.) into a short,
 * safe message that is fine to persist and show back in the operations UI.
 * Never leak raw SDK payloads, stack traces, or request bodies.
 */
export function normalizeAIError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'ZodError') {
      return 'AI response did not match the expected structured format.';
    }
    if (error.name === 'AbortError' || /timeout/i.test(error.message)) {
      return 'AI provider request timed out.';
    }
    return error.message.slice(0, 300);
  }
  return 'Unknown AI provider error.';
}
