# Multi-Tenant Chatbot System

## Overview

This chatbot system has been converted into a multi-tenant architecture that can serve different websites with their own:
- Data content (stored in separate markdown files)
- System prompts (customized for each business)
- Branding (dynamic website names and descriptions)
- Domain-specific responses

## How It Works

### 1. Website Detection

The system automatically detects which website the chatbot is being used for through multiple methods:

1. **URL Parameter** (Highest Priority): `?websiteId=akashdth`
2. **Origin Header**: When embedded via iframe, detects the parent website
3. **Referer Header**: Fallback detection method
4. **Host Header**: For direct access
5. **Custom Header**: `X-Iframe-Src` for manual override

### 2. Website Configurations

Located in `lib/website-config.ts`, this defines all available websites:

```typescript
export const WEBSITE_CONFIGS = {
  'akashdth': {
    name: 'AkashDTH',
    domain: 'akashdth.com',
    dataFile: 'akashdth.md',
    systemPromptFile: 'akashdth-system-prompt.md'
  },
  'streamplay': {
    name: 'StreamPlay', 
    domain: 'streamplay.com',
    dataFile: 'streamplay.md',
    systemPromptFile: 'streamplay-system-prompt.md'
  },
  // ... more configurations
}
```

### 3. Data Files Structure

**Data Files** (`/data/` folder):
- `akashdth.md` - AkashDTH service information
- `streamplay.md` - StreamPlay platform details
- `matchbestgroup.md` - Business consulting info
- `website3.md` - Generic template
- `cignal.md` - Cignal TV services

**System Prompts** (`/prompts/` folder):
- `akashdth-system-prompt.md` - DTH TV assistant personality
- `streamplay-system-prompt.md` - Streaming platform assistant
- `matchbestgroup-system-prompt.md` - Business consultant
- `website3-system-prompt.md` - Generic assistant
- `cignal-system-prompt.md` - Digital TV assistant

## Adding New Websites

### Step 1: Add Website Configuration

Edit `lib/website-config.ts` and add your new website:

```typescript
'yourwebsite': {
  id: 'yourwebsite',
  name: 'Your Website Name',
  domain: 'yourwebsite.com',
  description: 'Description of your website',
  dataFile: 'yourwebsite.md',
  systemPromptFile: 'yourwebsite-system-prompt.md',
  theme: {
    primaryColor: '#your-color',
    logo: '/your-logo.svg'
  }
}
```

### Step 2: Create Data File

Create `/data/yourwebsite.md` with your website's information:

```markdown
# Your Website Name

Description of your business and services...

## Services
- Service 1
- Service 2

## Contact Information
- Phone: xxx-xxx-xxxx
- Website: yourwebsite.com
```

### Step 3: Create System Prompt

Create `/prompts/yourwebsite-system-prompt.md`:

```markdown
# System Prompt for Your Website

You are a professional AI assistant for Your Website Name...

## Your Role
- Help users with [your specific services]
- Provide information about [your offerings]

## Tone & Personality
- Professional and helpful
- Knowledgeable about [your industry]
```

### Step 4: Update Frontend (Optional)

If you want the website name to appear in the UI, update:
- `components/header.tsx` - website names mapping
- `components/chat-form.tsx` - website configs for display

## Embedding Instructions

### For Website Owners

Add this iframe to your website:

```html
<iframe 
  src="https://your-chatbot-domain.com/?websiteId=yourwebsite"
  width="400" 
  height="600"
  frameborder="0"
  style="border: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  title="Your Website Chatbot">
</iframe>
```

### Automatic Detection

If you prefer automatic detection without URL parameters, the system will detect your domain automatically when the iframe is embedded on your website.

## Testing

### Local Testing

1. **Direct Testing**: Visit different URLs:
   - `http://localhost:3000/?websiteId=akashdth`
   - `http://localhost:3000/?websiteId=streamplay`
   - `http://localhost:3000/?websiteId=cignal`

2. **Test Page**: Visit `/test-multitenant` to test all configurations

3. **Embed Preview**: Visit `/embed-example` to see iframe embedding examples

### Production Testing

1. Deploy to your hosting platform (AWS/Vercel/etc.)
2. Test iframe embedding from different domains
3. Verify automatic domain detection works correctly

## File Structure

```
├── lib/
│   ├── website-config.ts      # Website configurations
│   └── website-detection.ts   # Detection logic
├── data/
│   ├── akashdth.md           # AkashDTH data
│   ├── streamplay.md         # StreamPlay data
│   ├── matchbestgroup.md     # MatchBest data
│   ├── website3.md           # Generic template
│   └── cignal.md             # Cignal data
├── prompts/
│   ├── akashdth-system-prompt.md
│   ├── streamplay-system-prompt.md
│   ├── matchbestgroup-system-prompt.md
│   ├── website3-system-prompt.md
│   └── cignal-system-prompt.md
├── app/
│   ├── api/chat/route.ts     # Updated multi-tenant API
│   ├── test-multitenant/     # Testing interface
│   └── embed-example/        # Embedding guide
└── components/
    ├── chat-form.tsx         # Dynamic UI
    └── header.tsx            # Dynamic header
```

## Environment Variables

Make sure you have set:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Key Features

✅ **Automatic Website Detection** - No manual configuration needed
✅ **Website-Specific Data** - Each site gets its own information
✅ **Custom System Prompts** - Tailored AI personality per website
✅ **Dynamic Branding** - Website names update automatically
✅ **Iframe Ready** - Built for embedding across multiple sites
✅ **Fallback System** - Graceful handling of unknown domains
✅ **Language Support** - Bengali and Tagalog language options
✅ **Testing Interface** - Built-in testing and preview tools

## Deployment Notes

When deploying to AWS or other platforms:

1. Ensure all data files and prompts are included in the build
2. Set up proper CORS headers for iframe embedding
3. Configure environment variables
4. Test cross-origin embedding functionality

This system is now ready to be deployed and used across multiple websites with automatic detection and website-specific responses!