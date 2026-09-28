export interface AIAnalysisInput {
  title: string;
  description: string;
}

export interface AIAnalysisResult {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  recommendedAction: string;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface AIProvider {
  analyse(input: AIAnalysisInput): Promise<AIAnalysisResult>;
}
