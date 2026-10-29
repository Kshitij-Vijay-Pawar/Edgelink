// src/prompts/seoAuditPrompt.ts

// Verbatim System Prompt from Section 7.2
export const MASTER_SEO_SYSTEM_PROMPT = `You are a senior SEO analyst with 15+ years experience specialising in
Indian local business websites, healthcare, dental, and real estate sectors.
You produce honest, falsifiable, prioritised SEO audit reports.
Your output must be valid JSON only — no markdown, no preamble.
Every recommendation must include: finding, fix, estimated_impact (High/Medium/Low),
effort (Hours/Days/Weeks), falsifiability_check (how we know if this worked).`;

export interface AuditRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Technical' | 'OnPage' | 'Content' | 'Schema' | 'CWV';
  finding: string;
  fix: string;
  estimated_impact: 'High' | 'Medium' | 'Low';
  effort: 'Hours' | 'Days' | 'Weeks';
  falsifiability_check: string;
}

export interface ClaudeAuditResponse {
  audit_version: string;
  overall_score: number;
  score_breakdown: {
    technical: number;
    on_page: number;
    content: number;
    core_web_vitals: number;
    schema: number;
  };
  critical_issues: string[];
  important_issues: string[];
  quick_wins: string[];
  recommendations: AuditRecommendation[];
  executive_summary: string;
}

export interface PromptVariables {
  url: string;
  businessType: string;
  city: string;
  state: string;
  onPageJson: string;
  technicalJson: string;
  cwvJson: string;
  schemaJson: string;
  gscJson: string;
  rankingsJson: string;
}

// Verbatim User Prompt Template from Section 7.2
export function buildUserPrompt(vars: PromptVariables): string {
  return `Analyse the following SEO signals for: ${vars.url}
Business type: ${vars.businessType}
Business location: ${vars.city}, ${vars.state}, India

=== ON-PAGE DATA ===
${vars.onPageJson}

=== TECHNICAL DATA ===
${vars.technicalJson}

=== CORE WEB VITALS ===
${vars.cwvJson}

=== SCHEMA.ORG DATA ===
${vars.schemaJson}

=== GOOGLE SEARCH CONSOLE ===
${vars.gscJson}

=== KEYWORD RANKINGS ===
${vars.rankingsJson}

Respond ONLY with this JSON structure — no other text:
{
 "audit_version": "v1.0",
 "overall_score": <integer 0-100>,
 "score_breakdown": { "technical": <0-100>, "on_page": <0-100>,
 "content": <0-100>, "core_web_vitals": <0-100>, "schema": <0-100> },
 "critical_issues": [<max 5 items>],
 "important_issues": [<max 8 items>],
 "quick_wins": [<max 5 items — effort <= 2 hours>],
 "recommendations": [{
 "priority": "CRITICAL|HIGH|MEDIUM|LOW",
 "category": "Technical|OnPage|Content|Schema|CWV",
 "finding": "<what is wrong>",
 "fix": "<exact action to take>",
 "estimated_impact": "High|Medium|Low",
 "effort": "Hours|Days|Weeks",
 "falsifiability_check": "<how to verify this worked>"
 }],
 "executive_summary": "<3 sentences max, plain English>"
}`;
}

