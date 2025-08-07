import { WebsiteConfig, getWebsiteConfigByDomain, getWebsiteConfigById, getDefaultWebsiteConfig } from './website-config'

/**
 * Extract domain from a URL string
 */
function extractDomain(url: string): string | null {
  try {
    const urlObject = new URL(url)
    return urlObject.hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Detect website configuration from various sources
 */
export function detectWebsite(request: Request): WebsiteConfig {
  // Method 1: Check for websiteId in the request body (highest priority)
  const url = new URL(request.url)
  const websiteId = url.searchParams.get('websiteId')
  
  if (websiteId) {
    const config = getWebsiteConfigById(websiteId)
    if (config) {
      console.log(`Website detected from websiteId parameter: ${config.name}`)
      return config
    }
  }

  // Method 2: Check the Origin header (for iframe embeddings)
  const origin = request.headers.get('origin')
  if (origin) {
    const domain = extractDomain(origin)
    if (domain) {
      const config = getWebsiteConfigByDomain(domain)
      if (config) {
        console.log(`Website detected from Origin header: ${config.name} (${domain})`)
        return config
      }
    }
  }

  // Method 3: Check the Referer header (fallback)
  const referer = request.headers.get('referer') || request.headers.get('referrer')
  if (referer) {
    const domain = extractDomain(referer)
    if (domain) {
      const config = getWebsiteConfigByDomain(domain)
      if (config) {
        console.log(`Website detected from Referer header: ${config.name} (${domain})`)
        return config
      }
    }
  }

  // Method 4: Check the Host header (for direct access)
  const host = request.headers.get('host')
  if (host) {
    const domain = host.toLowerCase().replace(/^www\./, '').split(':')[0] // Remove port if present
    const config = getWebsiteConfigByDomain(domain)
    if (config) {
      console.log(`Website detected from Host header: ${config.name} (${domain})`)
      return config
    }
  }

  // Method 5: Parse iframe source from custom header (if implemented by frontend)
  const iframeSrc = request.headers.get('x-iframe-src')
  if (iframeSrc) {
    const domain = extractDomain(iframeSrc)
    if (domain) {
      const config = getWebsiteConfigByDomain(domain)
      if (config) {
        console.log(`Website detected from X-Iframe-Src header: ${config.name} (${domain})`)
        return config
      }
    }
  }

  // Fallback to default configuration
  const defaultConfig = getDefaultWebsiteConfig()
  console.log(`Using default website configuration: ${defaultConfig.name}`)
  return defaultConfig
}

/**
 * Create website-specific context for the chat API
 */
export async function createWebsiteContext(websiteConfig: WebsiteConfig): Promise<{
  systemPrompt: string
  websiteData: string
  websiteInfo: {
    id: string
    name: string
    description: string
  }
}> {
  const { loadWebsiteData, loadWebsiteSystemPrompt } = await import('./website-config')
  
  const [systemPrompt, websiteData] = await Promise.all([
    loadWebsiteSystemPrompt(websiteConfig),
    loadWebsiteData(websiteConfig)
  ])

  return {
    systemPrompt,
    websiteData,
    websiteInfo: {
      id: websiteConfig.id,
      name: websiteConfig.name,
      description: websiteConfig.description
    }
  }
}

/**
 * Log detection details for debugging
 */
export function logDetectionDetails(request: Request, detectedConfig: WebsiteConfig): void {
  const headers = {
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    host: request.headers.get('host'),
    'x-iframe-src': request.headers.get('x-iframe-src'),
    'user-agent': request.headers.get('user-agent')
  }

  console.log('Website Detection Details:', {
    detectedWebsite: {
      id: detectedConfig.id,
      name: detectedConfig.name,
      domain: detectedConfig.domain
    },
    headers: Object.fromEntries(
      Object.entries(headers).filter(([_, value]) => value !== null)
    ),
    url: request.url
  })
}