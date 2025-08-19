import fs from "fs/promises";
import path from "path";

export interface WebsiteConfig {
  id: string;
  name: string;
  domain: string;
  description: string;
  dataFile: string;
  systemPromptFile: string;
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
}

// Website configurations
export const WEBSITE_CONFIGS: Record<string, WebsiteConfig> = {
  akashdth: {
    id: "akashdth",
    name: "AkashDTH",
    domain: "akashdth.com",
    description:
      "Bangladesh's first Direct-to-Home (DTH) satellite TV provider",
    dataFile: "akashdth.md",
    systemPromptFile: "akashdth-system-prompt.md",
    theme: {
      primaryColor: "#1e40af",
      logo: "/akash-logo.svg",
    },
  },
  streamplay: {
    id: "streamplay",
    name: "StreamPlay",
    domain: "streamplay.com",
    description: "Streaming platform for entertainment content",
    dataFile: "streamplay.md",
    systemPromptFile: "streamplay-system-prompt.md",
    theme: {
      primaryColor: "#dc2626",
      logo: "/streamplay-logo.svg",
    },
  },
  matchbestgroup: {
    id: "matchbestgroup",
    name: "MatchBest Group",
    domain: "matchbestgroup.com",
    description: "Business consulting and services group",
    dataFile: "matchbestgroup.md",
    systemPromptFile: "matchbestgroup-system-prompt.md",
    theme: {
      primaryColor: "#059669",
      logo: "/matchbest-logo.svg",
    },
  },
  website3: {
    id: "website3",
    name: "Website3",
    domain: "website3.com",
    description: "Generic website configuration",
    dataFile: "website3.md",
    systemPromptFile: "website3-system-prompt.md",
    theme: {
      primaryColor: "#7c2d12",
      logo: "/website3-logo.svg",
    },
  },
  cignal: {
    id: "cignal",
    name: "Cignal",
    domain: "cignal.tv",
    description: "Digital satellite television service",
    dataFile: "cignal.md", // This file needs to be created
    systemPromptFile: "cignal-system-prompt.md",
    theme: {
      primaryColor: "#1d4ed8",
      logo: "/cignal-logo.svg",
    },
  },
  ava: {
    id: "ava",
    name: "AVA",
    domain: "ava.matchbestsoftware.com",
    description:
      "Multilingual AI assistant that automates customer conversations",
    dataFile: "ava.md",
    systemPromptFile: "ava-system-prompt.md",
    theme: {
      primaryColor: "#8b5cf6",
      logo: "/ava-logo.svg",
    },
  },
};

/**
 * Get website configuration by domain
 */
export function getWebsiteConfigByDomain(domain: string): WebsiteConfig | null {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, "");

  for (const config of Object.values(WEBSITE_CONFIGS)) {
    if (config.domain === normalizedDomain) {
      return config;
    }
  }

  return null;
}

/**
 * Get website configuration by ID
 */
export function getWebsiteConfigById(id: string): WebsiteConfig | null {
  return WEBSITE_CONFIGS[id] || null;
}

/**
 * Detect website from referrer URL
 */
export function detectWebsiteFromReferrer(
  referrer: string
): WebsiteConfig | null {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    return getWebsiteConfigByDomain(url.hostname);
  } catch {
    return null;
  }
}

/**
 * Load website data content
 */
export async function loadWebsiteData(
  websiteConfig: WebsiteConfig
): Promise<string> {
  try {
    const dataPath = path.join(process.cwd(), "data", websiteConfig.dataFile);
    const content = await fs.readFile(dataPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Failed to load data for ${websiteConfig.id}:`, error);
    return `No data available for ${websiteConfig.name}`;
  }
}

/**
 * Load website system prompt
 */
export async function loadWebsiteSystemPrompt(
  websiteConfig: WebsiteConfig
): Promise<string> {
  try {
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      websiteConfig.systemPromptFile
    );
    const content = await fs.readFile(promptPath, "utf-8");
    return content;
  } catch (error) {
    console.error(
      `Failed to load system prompt for ${websiteConfig.id}:`,
      error
    );
    return `You are a helpful AI assistant for ${websiteConfig.name}. Please assist users with their questions about our services.`;
  }
}

/**
 * Get default website configuration (fallback)
 */
export function getDefaultWebsiteConfig(): WebsiteConfig {
  return WEBSITE_CONFIGS["akashdth"]; // Default to AkashDTH
}

/**
 * Get all available website configurations
 */
export function getAllWebsiteConfigs(): WebsiteConfig[] {
  return Object.values(WEBSITE_CONFIGS);
}
