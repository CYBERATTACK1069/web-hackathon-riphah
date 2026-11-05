/**
 * Deterministic AI Hallucination & Evidence Verification Engine
 * Enterprise Swiss-Grid Architecture Contract (Requirement 3.10)
 *
 * Verifies that every extracted skill, experience claim, and project is grounded
 * in verbatim excerpts from the raw source document, detecting hallucinations,
 * ungrounded claims, and temporal impossibilities.
 */

import type {
  ResumeExcerptCitation,
  HallucinationVerificationFlag,
  HallucinationRiskLevel,
} from "@/types/platform";

export interface ClaimVerificationItem {
  targetField: "skill" | "work_experience" | "project" | "education" | "certification";
  identifier: string; // e.g. "React", "Senior Engineer at Stripe", "E-Commerce Microservices"
  sourceExcerpt?: string;
  claimedYears?: number;
  startDate?: string;
  endDate?: string;
}

export interface VerificationResultItem {
  targetField: "skill" | "work_experience" | "project" | "education" | "certification";
  identifier: string;
  verified: boolean;
  confidence: number;
  citation?: ResumeExcerptCitation;
  flag?: HallucinationVerificationFlag;
  statusBadge: "Source Verified in Resume" | "Flagged for Manual Review - Potential Hallucination";
}

export interface ComprehensiveVerificationReport {
  citations: ResumeExcerptCitation[];
  flags: HallucinationVerificationFlag[];
  verifiedCount: number;
  unverifiedCount: number;
  totalClaimsCount: number;
  overallRiskLevel: HallucinationRiskLevel;
  verificationRatio: number; // 0.0 to 1.0
  results: VerificationResultItem[];
}

/**
 * Clean and normalize text for fuzzy comparison
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize string into non-trivial words
 */
function tokenize(str: string): string[] {
  const stopWords = new Set(["the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by", "of", "from"]);
  return normalizeForComparison(str)
    .split(" ")
    .filter((word) => word.length > 1 && !stopWords.has(word));
}

/**
 * Extract context snippet around start and end character positions
 */
function extractContextSnippet(rawText: string, start: number, end: number, padding: number = 55): string {
  const snippetStart = Math.max(0, start - padding);
  const snippetEnd = Math.min(rawText.length, end + padding);
  
  let snippet = rawText.slice(snippetStart, snippetEnd).replace(/[\r\n]+/g, " ").trim();
  if (snippetStart > 0) snippet = "..." + snippet;
  if (snippetEnd < rawText.length) snippet = snippet + "...";
  return snippet;
}

/**
 * Helper: Escape characters for dynamic RegExp construction
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Deterministically verify an excerpt against the raw document text.
 * Performs a 3-stage verification:
 * 1. Exact verbatim character match / normalized whitespace & line-break match
 * 2. Punctuation-normalized phrase match
 * 3. Sliding window token overlap match (threshold 0.70) across lines/paragraphs
 */
export function verifyExcerptInText(
  excerpt: string,
  rawText: string
): {
  verified: boolean;
  confidence: number;
  characterStart: number;
  characterEnd: number;
  contextSnippet: string;
} {
  if (!excerpt || !excerpt.trim() || !rawText || !rawText.trim()) {
    return {
      verified: false,
      confidence: 0,
      characterStart: -1,
      characterEnd: -1,
      contextSnippet: "No source excerpt or document text provided.",
    };
  }

  const trimmedExcerpt = excerpt.trim();

  // Stage 1a: Exact verbatim substring match
  const exactIndex = rawText.indexOf(trimmedExcerpt);
  if (exactIndex !== -1) {
    const end = exactIndex + trimmedExcerpt.length;
    return {
      verified: true,
      confidence: 1.0,
      characterStart: exactIndex,
      characterEnd: end,
      contextSnippet: extractContextSnippet(rawText, exactIndex, end),
    };
  }

  // Stage 1b: Case-insensitive verbatim match
  const lowerRaw = rawText.toLowerCase();
  const lowerExcerpt = trimmedExcerpt.toLowerCase();
  const caseInsensitiveIndex = lowerRaw.indexOf(lowerExcerpt);
  if (caseInsensitiveIndex !== -1) {
    const end = caseInsensitiveIndex + trimmedExcerpt.length;
    return {
      verified: true,
      confidence: 0.98,
      characterStart: caseInsensitiveIndex,
      characterEnd: end,
      contextSnippet: extractContextSnippet(rawText, caseInsensitiveIndex, end),
    };
  }

  // Stage 1c: Normalized whitespace & line-break regex match
  // Handles excerpts wrapping across line breaks, multiple spaces, or tabs in PDF text
  try {
    const tokens = trimmedExcerpt.split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      const regexPattern = tokens.map(escapeRegExp).join("\\s+");
      const whitespaceRegex = new RegExp(regexPattern, "i");
      const match = rawText.match(whitespaceRegex);
      if (match && typeof match.index === "number") {
        const start = match.index;
        const end = start + match[0].length;
        return {
          verified: true,
          confidence: 0.95,
          characterStart: start,
          characterEnd: end,
          contextSnippet: extractContextSnippet(rawText, start, end),
        };
      }
    }
  } catch {
    // If regex construction fails on unusual characters, fall through to token matching
  }

  // Stage 2: Token-based sliding window match (across lines and paragraphs)
  const excerptTokens = tokenize(trimmedExcerpt);
  if (excerptTokens.length === 0) {
    return {
      verified: false,
      confidence: 0,
      characterStart: -1,
      characterEnd: -1,
      contextSnippet: "Excerpt contains no verifiable semantic tokens.",
    };
  }

  // Build a sliding paragraph window (3 consecutive lines) to catch multi-line wrapped excerpts
  const lines = rawText.split(/\r?\n/);
  const lineOffsets: number[] = [];
  let runningOffset = 0;
  for (const line of lines) {
    lineOffsets.push(runningOffset);
    runningOffset += line.length + 1; // +1 for newline
  }

  let bestOverlapRatio = 0;
  let bestMatchStart = -1;
  let bestMatchEnd = -1;

  // Window sizes from 1 line to 4 lines
  for (let windowSize = 1; windowSize <= Math.min(4, lines.length); windowSize++) {
    for (let i = 0; i <= lines.length - windowSize; i++) {
      const windowText = lines.slice(i, i + windowSize).join(" ").trim();
      if (windowText.length < 5) continue;

      const windowTokens = new Set(tokenize(windowText));
      let matches = 0;
      for (const token of excerptTokens) {
        if (windowTokens.has(token)) {
          matches++;
        }
      }

      const overlap = matches / excerptTokens.length;
      if (overlap > bestOverlapRatio) {
        bestOverlapRatio = overlap;
        bestMatchStart = lineOffsets[i];
        const lastLineIdx = i + windowSize - 1;
        bestMatchEnd = lineOffsets[lastLineIdx] + lines[lastLineIdx].length;
      }
    }
  }

  // Threshold: at least 70% semantic token overlap qualifies as verified fuzzy match
  if (bestOverlapRatio >= 0.70) {
    return {
      verified: true,
      confidence: parseFloat((0.72 + bestOverlapRatio * 0.23).toFixed(2)),
      characterStart: bestMatchStart,
      characterEnd: bestMatchEnd,
      contextSnippet: extractContextSnippet(rawText, bestMatchStart, bestMatchEnd),
    };
  }

  // Failed verification
  return {
    verified: false,
    confidence: parseFloat((bestOverlapRatio * 0.45).toFixed(2)),
    characterStart: -1,
    characterEnd: -1,
    contextSnippet: "Excerpt not found in resume text. Possible AI hallucination or fabricated claim.",
  };
}

/**
 * Calculate total career duration in years from documented start and end dates.
 * Correctly distinguishes past completed careers from ongoing "Present" positions.
 */
export function calculateCareerDurationYears(
  experiences: Array<{ startDate?: string; endDate?: string; isCurrent?: boolean }>
): number {
  if (!experiences || experiences.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  let earliestYear = Infinity;
  let latestYear = -Infinity;
  let hasValidDates = false;
  let hasCurrentJob = false;

  for (const exp of experiences) {
    if (exp.startDate) {
      const match = exp.startDate.match(/\b(19\d\d|20\d\d)\b/);
      if (match) {
        const year = parseInt(match[1], 10);
        earliestYear = Math.min(earliestYear, year);
        hasValidDates = true;
      }
    }

    const isCurrent =
      Boolean(exp.isCurrent) ||
      (typeof exp.endDate === "string" && /present|current/i.test(exp.endDate));

    if (isCurrent) {
      hasCurrentJob = true;
      hasValidDates = true;
    } else if (exp.endDate) {
      const match = exp.endDate.match(/\b(19\d\d|20\d\d)\b/);
      if (match) {
        const year = parseInt(match[1], 10);
        latestYear = Math.max(latestYear, year);
        hasValidDates = true;
      }
    }
  }

  if (!hasValidDates || earliestYear === Infinity) return 0;

  if (hasCurrentJob) {
    latestYear = Math.max(latestYear, currentYear);
  } else if (latestYear === -Infinity) {
    // If no end date was specified on any past position, default to current year
    latestYear = currentYear;
  }

  return Math.max(1, latestYear - earliestYear + 1);
}

/**
 * Execute comprehensive verification pass across all extracted items:
 * - Excerpt groundedness check
 * - Temporal contradiction analysis
 * - Hallucination risk scoring
 */
export function verifyAllClaims(
  rawText: string,
  claims: ClaimVerificationItem[],
  experiences: Array<{ startDate?: string; endDate?: string; isCurrent?: boolean }> = []
): ComprehensiveVerificationReport {
  const citations: ResumeExcerptCitation[] = [];
  const flags: HallucinationVerificationFlag[] = [];
  const results: VerificationResultItem[] = [];

  const totalCareerYears = calculateCareerDurationYears(experiences);
  let verifiedCount = 0;
  let unverifiedCount = 0;

  claims.forEach((claim, idx) => {
    const citationId = `cit-${claim.targetField}-${idx + 1}`;
    const check = verifyExcerptInText(claim.sourceExcerpt || "", rawText);

    if (check.verified) {
      verifiedCount++;
      const citation: ResumeExcerptCitation = {
        id: citationId,
        targetField: claim.targetField,
        associatedIdentifier: claim.identifier,
        excerptText: claim.sourceExcerpt || "",
        characterStart: check.characterStart,
        characterEnd: check.characterEnd,
        contextSnippet: check.contextSnippet,
        confidence: check.confidence,
      };
      citations.push(citation);

      results.push({
        targetField: claim.targetField,
        identifier: claim.identifier,
        verified: true,
        confidence: check.confidence,
        citation,
        statusBadge: "Source Verified in Resume",
      });
    } else {
      unverifiedCount++;
      const flagId = `flag-hallucination-${idx + 1}`;
      const flag: HallucinationVerificationFlag = {
        id: flagId,
        claimType: "ungrounded_skill",
        suspectClaim: claim.identifier,
        reason: claim.sourceExcerpt
          ? `Verbatim quote ("${claim.sourceExcerpt.slice(0, 60)}...") could not be located anywhere in the uploaded document text.`
          : `No source excerpt was provided by the extractor for ${claim.identifier}.`,
        severity: "high",
        status: "verified_hallucination",
        detectedConfidence: 0.95,
        recommendedInterviewProbe: `Ask candidate to explain specific real-world production projects where they implemented ${claim.identifier}.`,
        evidenceExcerptIds: [],
      };
      flags.push(flag);

      results.push({
        targetField: claim.targetField,
        identifier: claim.identifier,
        verified: false,
        confidence: 0,
        flag,
        statusBadge: "Flagged for Manual Review - Potential Hallucination",
      });
    }

    // Temporal impossibility sanity check
    if (claim.targetField === "skill" && claim.claimedYears && totalCareerYears > 0) {
      if (claim.claimedYears > totalCareerYears + 1) {
        const temporalFlagId = `flag-temporal-${idx + 1}`;
        flags.push({
          id: temporalFlagId,
          claimType: "temporal_impossibility",
          suspectClaim: `${claim.identifier} (${claim.claimedYears} years claimed)`,
          reason: `Candidate claims ${claim.claimedYears} years of experience in ${claim.identifier}, but documented employment history spans only ~${totalCareerYears} years.`,
          severity: "critical",
          status: "verified_hallucination",
          detectedConfidence: 0.98,
          recommendedInterviewProbe: `Probe timeline discrepancy: verify when candidate started using ${claim.identifier} and whether this includes pre-professional or student work.`,
          evidenceExcerptIds: [],
        });
      }
    }
  });

  const totalClaims = claims.length || 1;
  const verificationRatio = parseFloat((verifiedCount / totalClaims).toFixed(2));

  // Determine overall risk level
  let overallRiskLevel: HallucinationRiskLevel = "clean";
  const criticalFlagsCount = flags.filter((f) => f.severity === "critical").length;
  const highFlagsCount = flags.filter((f) => f.severity === "high").length;

  if (criticalFlagsCount > 0) {
    overallRiskLevel = "critical";
  } else if (highFlagsCount >= 3) {
    overallRiskLevel = "high";
  } else if (highFlagsCount >= 1) {
    overallRiskLevel = "medium";
  } else if (unverifiedCount > 0) {
    overallRiskLevel = "low";
  }

  return {
    citations,
    flags,
    verifiedCount,
    unverifiedCount,
    totalClaimsCount: claims.length,
    overallRiskLevel,
    verificationRatio,
    results,
  };
}
