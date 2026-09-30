import { validateAIResult } from './ai-analysis.schema';

describe('validateAIResult', () => {
  const valid = {
    category: 'DOCUMENT_REQUEST',
    priority: 'HIGH',
    summary: 'The applicant needs to provide their latest payslip.',
    recommendedAction: 'Request the missing payslip from the applicant.',
  };

  it('accepts a well-formed AI response', () => {
    expect(validateAIResult(valid)).toEqual(valid);
  });

  it('rejects an unexpected priority value', () => {
    expect(() => validateAIResult({ ...valid, priority: 'URGENT' })).toThrow();
  });

  it('rejects a response missing required fields', () => {
    const { summary: _summary, ...withoutSummary } = valid;
    expect(() => validateAIResult(withoutSummary)).toThrow();
  });

  it('rejects a non-object payload, e.g. a malformed provider reply', () => {
    expect(() => validateAIResult('not an object')).toThrow();
    expect(() => validateAIResult(null)).toThrow();
  });
});
