import { normalizeAIError } from './normalize-ai-error';

describe('normalizeAIError', () => {
  it('maps a ZodError to a safe validation message', () => {
    const error = new Error('invalid_type');
    error.name = 'ZodError';
    expect(normalizeAIError(error)).toBe('AI response did not match the expected structured format.');
  });

  it('maps an AbortError / timeout to a safe timeout message', () => {
    const error = new Error('The operation timed out');
    error.name = 'AbortError';
    expect(normalizeAIError(error)).toBe('AI provider request timed out.');
  });

  it('truncates long provider error messages instead of leaking the full payload', () => {
    const longMessage = 'x'.repeat(500);
    expect(normalizeAIError(new Error(longMessage))).toHaveLength(300);
  });

  it('returns a generic message for non-Error throwables', () => {
    expect(normalizeAIError('some string')).toBe('Unknown AI provider error.');
  });
});
