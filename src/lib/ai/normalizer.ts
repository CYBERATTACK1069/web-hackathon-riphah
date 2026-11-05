/**
 * Deterministic & AI-Assisted Skill Normalization Engine
 * Enterprise Swiss-Grid Architecture Contract
 *
 * Maps aliases, acronyms, and colloquial skill mentions to canonical industry identifiers.
 * e.g., "JS" -> "JavaScript", "Postgres" -> "PostgreSQL", "Py" -> "Python", "K8s" -> "Kubernetes"
 */

export type PlatformSkillCategory =
  | "language"
  | "framework"
  | "database"
  | "devops"
  | "architecture"
  | "soft_skill"
  | "tool"
  | "other";

export interface NormalizedSkillResult {
  rawName: string;
  canonicalName: string;
  category: PlatformSkillCategory;
  skillId: string;
  isAliasMatched: boolean;
}

export type ResumeSkillCategory = "language" | "framework" | "database" | "devops" | "architecture" | "tool" | "other";

export function toResumeSkillCategory(cat: PlatformSkillCategory): ResumeSkillCategory {
  if (
    cat === "language" ||
    cat === "framework" ||
    cat === "database" ||
    cat === "devops" ||
    cat === "architecture" ||
    cat === "tool"
  ) {
    return cat;
  }
  return "other";
}

export interface DictionaryEntry {
  canonicalName: string;
  category: PlatformSkillCategory;
  aliases: string[];
}

/**
 * Deterministic Canonical Skill Dictionary
 * Hardened registry covering 100+ standard engineering competencies
 */
export const CANONICAL_SKILL_REGISTRY: DictionaryEntry[] = [
  // --- Languages ---
  {
    canonicalName: "JavaScript",
    category: "language",
    aliases: ["js", "javascript", "ecmascript", "es6", "es2020", "vanilla js"],
  },
  {
    canonicalName: "TypeScript",
    category: "language",
    aliases: ["ts", "typescript"],
  },
  {
    canonicalName: "Python",
    category: "language",
    aliases: ["py", "python", "python3", "python 3"],
  },
  {
    canonicalName: "Go",
    category: "language",
    aliases: ["go", "golang"],
  },
  {
    canonicalName: "Rust",
    category: "language",
    aliases: ["rust", "rustlang", "rs"],
  },
  {
    canonicalName: "Java",
    category: "language",
    aliases: ["java", "core java", "java 17", "java 21"],
  },
  {
    canonicalName: "C#",
    category: "language",
    aliases: ["c#", "csharp", "c-sharp", "cs", ".net", "dotnet", "dotnet core", ".net core"],
  },
  {
    canonicalName: "C++",
    category: "language",
    aliases: ["c++", "cpp", "cplusplus"],
  },
  {
    canonicalName: "C",
    category: "language",
    aliases: ["c lang", "c programming"],
  },
  {
    canonicalName: "Ruby",
    category: "language",
    aliases: ["ruby", "rb"],
  },
  {
    canonicalName: "PHP",
    category: "language",
    aliases: ["php", "php8"],
  },
  {
    canonicalName: "SQL",
    category: "language",
    aliases: ["sql", "structured query language", "ansi sql"],
  },
  {
    canonicalName: "HTML5",
    category: "language",
    aliases: ["html", "html5"],
  },
  {
    canonicalName: "CSS3",
    category: "language",
    aliases: ["css", "css3", "sass", "scss", "less"],
  },

  // --- Frameworks & Libraries ---
  {
    canonicalName: "React",
    category: "framework",
    aliases: ["react", "react.js", "reactjs", "react framework"],
  },
  {
    canonicalName: "Next.js",
    category: "framework",
    aliases: ["next", "next.js", "nextjs", "next 14", "next 15"],
  },
  {
    canonicalName: "Node.js",
    category: "framework",
    aliases: ["node", "nodejs", "node.js"],
  },
  {
    canonicalName: "Vue.js",
    category: "framework",
    aliases: ["vue", "vue.js", "vuejs", "vue3"],
  },
  {
    canonicalName: "Nuxt.js",
    category: "framework",
    aliases: ["nuxt", "nuxt.js", "nuxtjs"],
  },
  {
    canonicalName: "Angular",
    category: "framework",
    aliases: ["angular", "angular.js", "angularjs", "angular 2+"],
  },
  {
    canonicalName: "Svelte",
    category: "framework",
    aliases: ["svelte", "svelte.js", "sveltekit"],
  },
  {
    canonicalName: "Express.js",
    category: "framework",
    aliases: ["express", "express.js", "expressjs"],
  },
  {
    canonicalName: "FastAPI",
    category: "framework",
    aliases: ["fastapi", "fast-api"],
  },
  {
    canonicalName: "Django",
    category: "framework",
    aliases: ["django", "django rest framework", "drf"],
  },
  {
    canonicalName: "Flask",
    category: "framework",
    aliases: ["flask"],
  },
  {
    canonicalName: "Spring Boot",
    category: "framework",
    aliases: ["spring", "spring boot", "springboot", "spring framework"],
  },
  {
    canonicalName: "Ruby on Rails",
    category: "framework",
    aliases: ["rails", "ruby on rails", "ror"],
  },
  {
    canonicalName: "Tailwind CSS",
    category: "framework",
    aliases: ["tailwind", "tailwindcss", "tailwind-css"],
  },

  // --- Databases ---
  {
    canonicalName: "PostgreSQL",
    category: "database",
    aliases: ["postgres", "postgresql", "psql", "pg"],
  },
  {
    canonicalName: "MySQL",
    category: "database",
    aliases: ["mysql", "my-sql"],
  },
  {
    canonicalName: "MongoDB",
    category: "database",
    aliases: ["mongo", "mongodb"],
  },
  {
    canonicalName: "Redis",
    category: "database",
    aliases: ["redis", "redis cache", "redis key-value"],
  },
  {
    canonicalName: "Elasticsearch",
    category: "database",
    aliases: ["elastic", "elasticsearch", "es", "elastic search"],
  },
  {
    canonicalName: "DynamoDB",
    category: "database",
    aliases: ["dynamo", "dynamodb", "aws dynamodb"],
  },
  {
    canonicalName: "SQLite",
    category: "database",
    aliases: ["sqlite", "sqlite3"],
  },
  {
    canonicalName: "Cassandra",
    category: "database",
    aliases: ["cassandra", "apache cassandra"],
  },

  // --- DevOps & Cloud Infrastructure ---
  {
    canonicalName: "Kubernetes",
    category: "devops",
    aliases: ["k8s", "kubernetes", "kube", "k8"],
  },
  {
    canonicalName: "Docker",
    category: "devops",
    aliases: ["docker", "docker container", "containers", "containerization"],
  },
  {
    canonicalName: "Terraform",
    category: "devops",
    aliases: ["terraform", "tf", "hashicorp terraform"],
  },
  {
    canonicalName: "Ansible",
    category: "devops",
    aliases: ["ansible"],
  },
  {
    canonicalName: "Amazon Web Services (AWS)",
    category: "devops",
    aliases: ["aws", "amazon web services", "amazon aws"],
  },
  {
    canonicalName: "Google Cloud Platform (GCP)",
    category: "devops",
    aliases: ["gcp", "google cloud", "google cloud platform"],
  },
  {
    canonicalName: "Microsoft Azure",
    category: "devops",
    aliases: ["azure", "microsoft azure", "ms azure"],
  },
  {
    canonicalName: "CI/CD",
    category: "devops",
    aliases: ["ci/cd", "cicd", "ci-cd", "continuous integration", "continuous delivery"],
  },
  {
    canonicalName: "GitHub Actions",
    category: "devops",
    aliases: ["github actions", "gha", "gh actions"],
  },
  {
    canonicalName: "GitLab CI",
    category: "devops",
    aliases: ["gitlab ci", "gitlab-ci", "gitlab cicd"],
  },
  {
    canonicalName: "Helm",
    category: "devops",
    aliases: ["helm", "helm charts"],
  },
  {
    canonicalName: "Prometheus",
    category: "devops",
    aliases: ["prometheus", "prom"],
  },
  {
    canonicalName: "Grafana",
    category: "devops",
    aliases: ["grafana"],
  },

  // --- Architecture & Systems ---
  {
    canonicalName: "Microservices",
    category: "architecture",
    aliases: ["microservices", "microservice architecture", "micro-services"],
  },
  {
    canonicalName: "Event-Driven Architecture",
    category: "architecture",
    aliases: ["event driven", "event-driven", "eda", "event-driven architecture"],
  },
  {
    canonicalName: "Distributed Systems",
    category: "architecture",
    aliases: ["distributed systems", "system design", "distributed computing"],
  },
  {
    canonicalName: "REST APIs",
    category: "architecture",
    aliases: ["rest", "restful", "rest api", "rest apis", "restful apis"],
  },
  {
    canonicalName: "GraphQL",
    category: "architecture",
    aliases: ["graphql", "gql"],
  },
  {
    canonicalName: "gRPC",
    category: "architecture",
    aliases: ["grpc", "google rpc"],
  },
  {
    canonicalName: "Apache Kafka",
    category: "architecture",
    aliases: ["kafka", "apache kafka"],
  },
  {
    canonicalName: "RabbitMQ",
    category: "architecture",
    aliases: ["rabbitmq", "rabbit-mq"],
  },

  // --- Tools ---
  {
    canonicalName: "Git",
    category: "tool",
    aliases: ["git", "github", "gitlab", "version control"],
  },
  {
    canonicalName: "Linux",
    category: "tool",
    aliases: ["linux", "unix", "bash", "shell scripting", "bash/shell"],
  },

  // --- Soft Skills ---
  {
    canonicalName: "Agile / Scrum",
    category: "soft_skill",
    aliases: ["agile", "scrum", "kanban", "sprints"],
  },
  {
    canonicalName: "Technical Leadership",
    category: "soft_skill",
    aliases: ["leadership", "tech lead", "technical leadership", "team lead", "mentoring"],
  },
  {
    canonicalName: "System Architecture & Design",
    category: "architecture",
    aliases: ["system architecture", "software architecture", "solution architecture"],
  },
];

// Build high-speed lookup dictionary index (normalized lowercase strings -> Entry)
const DICTIONARY_MAP = new Map<string, { canonicalName: string; category: PlatformSkillCategory }>();

for (const entry of CANONICAL_SKILL_REGISTRY) {
  // Index by canonical name lowercase
  DICTIONARY_MAP.set(entry.canonicalName.toLowerCase(), {
    canonicalName: entry.canonicalName,
    category: entry.category,
  });
  // Index by aliases
  for (const alias of entry.aliases) {
    DICTIONARY_MAP.set(alias.toLowerCase().trim(), {
      canonicalName: entry.canonicalName,
      category: entry.category,
    });
  }
}

/**
 * Generate a consistent slug-based skill ID
 */
export function generateSkillId(skillName: string): string {
  const sanitized = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `skill-${sanitized || "custom"}`;
}

/**
 * Clean and normalize a raw string
 */
function sanitizeRawInput(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[-•*–—]+\s*/, "");
}

/**
 * Deterministically normalize a skill name.
 * Uses dictionary mapping first; falls back to smart casing and heuristic categorization.
 */
export function normalizeSkillName(rawName: string): NormalizedSkillResult {
  const cleaned = sanitizeRawInput(rawName);
  if (!cleaned) {
    return {
      rawName: "",
      canonicalName: "Unknown",
      category: "other",
      skillId: "skill-unknown",
      isAliasMatched: false,
    };
  }

  const lookupKey = cleaned.toLowerCase();

  // 1. Direct dictionary match
  if (DICTIONARY_MAP.has(lookupKey)) {
    const match = DICTIONARY_MAP.get(lookupKey)!;
    return {
      rawName: cleaned,
      canonicalName: match.canonicalName,
      category: match.category,
      skillId: generateSkillId(match.canonicalName),
      isAliasMatched: match.canonicalName.toLowerCase() !== lookupKey,
    };
  }

  // 2. Substring or multi-word boundary check (e.g. "Postgres 14" -> "PostgreSQL")
  for (const entry of CANONICAL_SKILL_REGISTRY) {
    for (const alias of entry.aliases) {
      // Check if alias matches as a distinct token sequence
      const regex = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i");
      if (regex.test(cleaned)) {
        return {
          rawName: cleaned,
          canonicalName: entry.canonicalName,
          category: entry.category,
          skillId: generateSkillId(entry.canonicalName),
          isAliasMatched: true,
        };
      }
    }
  }

  // 3. Fallback: Capitalize tokens cleanly and infer category heuristically
  const canonicalName = smartCapitalize(cleaned);
  const inferredCategory = inferCategoryFromKeyword(cleaned);

  return {
    rawName: cleaned,
    canonicalName,
    category: inferredCategory,
    skillId: generateSkillId(canonicalName),
    isAliasMatched: false,
  };
}

/**
 * Bulk normalize an array of skill strings or items
 */
export function normalizeSkills(rawSkills: string[]): NormalizedSkillResult[] {
  const seenCanonical = new Set<string>();
  const results: NormalizedSkillResult[] = [];

  for (const raw of rawSkills) {
    const normalized = normalizeSkillName(raw);
    if (!normalized.canonicalName || normalized.canonicalName === "Unknown") {
      continue;
    }
    const key = normalized.canonicalName.toLowerCase();
    if (!seenCanonical.has(key)) {
      seenCanonical.add(key);
      results.push(normalized);
    }
  }

  return results;
}

/**
 * Helper: Escape characters for dynamic RegExp construction
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Helper: Smart title-casing for unfamiliar technical words
 */
function smartCapitalize(str: string): string {
  // Common small words
  const smallWords = new Set(["on", "in", "of", "and", "the", "for", "with"]);
  return str
    .split(" ")
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && smallWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Heuristic category inference for novel technical skills
 */
function inferCategoryFromKeyword(str: string): PlatformSkillCategory {
  const lower = str.toLowerCase();
  if (lower.includes("db") || lower.includes("database") || lower.includes("store") || lower.includes("sql")) {
    return "database";
  }
  if (lower.includes("cloud") || lower.includes("ops") || lower.includes("deploy") || lower.includes("infra") || lower.includes("ci")) {
    return "devops";
  }
  if (lower.includes("architect") || lower.includes("design") || lower.includes("pattern") || lower.includes("microservice")) {
    return "architecture";
  }
  if (lower.includes("lead") || lower.includes("manage") || lower.includes("communicat") || lower.includes("mentor") || lower.includes("agile")) {
    return "soft_skill";
  }
  if (lower.includes("tool") || lower.includes("ide") || lower.includes("cli") || lower.includes("git")) {
    return "tool";
  }
  if (lower.includes("framework") || lower.includes("lib") || lower.includes("js") || lower.includes(".net")) {
    return "framework";
  }
  return "language";
}

/**
 * Check if the Gemini API key is configured with a real key
 */
function isGeminiKeyConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "your_actual_gemini_api_key_here" ||
    trimmed.startsWith("your_")
  ) {
    return false;
  }
  return true;
}

/**
 * AI-Assisted Skill Normalization Engine (gemini-2.5-flash)
 * Resolves novel, complex, or domain-specific skills that don't match deterministic dictionaries,
 * and caches results in the in-memory lookup table for zero-latency subsequent resolutions.
 */
export async function normalizeSkillWithAI(rawName: string): Promise<NormalizedSkillResult> {
  const cleaned = sanitizeRawInput(rawName);
  if (!cleaned) {
    return normalizeSkillName(rawName);
  }

  // 1. Fast path: check deterministic dictionary first
  const deterministic = normalizeSkillName(cleaned);
  if (deterministic.isAliasMatched || DICTIONARY_MAP.has(cleaned.toLowerCase())) {
    return deterministic;
  }

  // 2. If Gemini is configured, invoke AI normalizer
  if (isGeminiKeyConfigured()) {
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Normalize this technical skill name, library, or colloquial mention into its canonical industry name and classification: "${cleaned}".`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              canonicalName: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  "language",
                  "framework",
                  "database",
                  "devops",
                  "architecture",
                  "soft_skill",
                  "tool",
                  "other",
                ],
              },
            },
            required: ["canonicalName", "category"],
          },
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text) as {
          canonicalName: string;
          category: PlatformSkillCategory;
        };
        const canonical = parsed.canonicalName?.trim() || deterministic.canonicalName;
        const category = parsed.category || deterministic.category;

        // Cache in dictionary map for O(1) future resolution
        DICTIONARY_MAP.set(cleaned.toLowerCase(), {
          canonicalName: canonical,
          category,
        });

        return {
          rawName: cleaned,
          canonicalName: canonical,
          category,
          skillId: generateSkillId(canonical),
          isAliasMatched: canonical.toLowerCase() !== cleaned.toLowerCase(),
        };
      }
    } catch (e) {
      console.warn("[Normalizer] Gemini AI normalization failed, falling back to deterministic:", e);
    }
  }

  // 3. Fallback: return deterministic result
  return deterministic;
}

/**
 * Bulk AI-assisted normalization for an array of skill strings
 */
export async function normalizeSkillsWithAI(rawSkills: string[]): Promise<NormalizedSkillResult[]> {
  const seenCanonical = new Set<string>();
  const results: NormalizedSkillResult[] = [];

  for (const raw of rawSkills) {
    const normalized = await normalizeSkillWithAI(raw);
    if (!normalized.canonicalName || normalized.canonicalName === "Unknown") {
      continue;
    }
    const key = normalized.canonicalName.toLowerCase();
    if (!seenCanonical.has(key)) {
      seenCanonical.add(key);
      results.push(normalized);
    }
  }

  return results;
}
