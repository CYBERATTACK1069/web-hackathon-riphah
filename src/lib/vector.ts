import { CandidateProfile } from "@/types";

/**
 * Computes cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

// Fixed semantic dimension vocabulary for recruitment domain vectors
export const DOMAIN_VOCABULARY = [
  "typescript",
  "javascript",
  "next.js",
  "react",
  "node.js",
  "python",
  "pytorch",
  "postgresql",
  "aws",
  "docker",
  "django",
  "celery",
  "kubernetes",
  "kafka",
  "redis",
  "graphql",
  "fastapi",
  "vector databases",
  "llm",
  "rag",
  "distributed systems",
  "streaming",
  "microservices",
  "accessibility",
  "ui/ux",
  "architecture",
  "performance",
  "latency",
];

/**
 * Converts a text string into a normalized term-frequency embedding vector
 */
export function generateDomainEmbedding(text: string): number[] {
  const lower = text.toLowerCase();
  const vector = new Array(DOMAIN_VOCABULARY.length).fill(0);

  DOMAIN_VOCABULARY.forEach((term, idx) => {
    // Exact or partial token match
    const regex = new RegExp(`\\b${term.replace(".", "\\.")}\\b`, "i");
    if (regex.test(lower)) {
      vector[idx] = 1.0;
    } else if (lower.includes(term)) {
      vector[idx] = 0.5;
    }
  });

  return vector;
}

/**
 * Generates an embedding vector for a candidate profile
 */
export function getCandidateEmbedding(candidate: CandidateProfile): number[] {
  const combinedText = [
    candidate.summary,
    candidate.skills.map((s) => s.normalizedName).join(" "),
    candidate.experience.map((e) => `${e.role} ${e.highlights.join(" ")}`).join(" "),
    candidate.projects.map((p) => `${p.title} ${p.description}`).join(" "),
    candidate.rawResumeText || "",
  ].join(" ");

  return generateDomainEmbedding(combinedText);
}

/**
 * 3.10: Semantic & Natural-Language Talent Search
 */
export function searchTalentSemantic(
  query: string,
  candidates: CandidateProfile[]
): {
  candidate: CandidateProfile;
  score: number; // 0 - 100
  matchingEvidence: string[];
}[] {
  const queryEmbedding = generateDomainEmbedding(query);
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  const results = candidates.map((cand) => {
    const candEmbedding = getCandidateEmbedding(cand);
    const sim = cosineSimilarity(queryEmbedding, candEmbedding);

    // Identify matching evidence excerpts
    const matchingEvidence: string[] = [];
    const candText = `${cand.summary} ${cand.skills.map((s) => s.normalizedName).join(", ")}`.toLowerCase();

    queryTokens.forEach((token) => {
      if (candText.includes(token)) {
        matchingEvidence.push(token);
      }
    });

    cand.skills.forEach((s) => {
      if (query.toLowerCase().includes(s.normalizedName.toLowerCase())) {
        if (!matchingEvidence.includes(s.normalizedName)) {
          matchingEvidence.push(s.normalizedName);
        }
      }
    });

    // Score between 50 and 99% if match, or scaled similarity
    const score = Math.round(Math.max(sim * 100, matchingEvidence.length > 0 ? 65 + matchingEvidence.length * 8 : 45));

    return {
      candidate: cand,
      score: Math.min(score, 98),
      matchingEvidence,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
