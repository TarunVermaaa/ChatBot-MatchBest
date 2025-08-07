'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const WEBSITE_EXAMPLES = [
  {
    id: 'akashdth',
    name: 'AkashDTH',
    domain: 'akashdth.com',
    url: 'https://akashdth.com',
    color: 'bg-blue-500'
  },
  {
    id: 'streamplay', 
    name: 'StreamPlay',
    domain: 'streamplay.com',
    url: 'https://streamplay.com',
    color: 'bg-red-500'
  },
  {
    id: 'matchbestgroup',
    name: 'MatchBest Group', 
    domain: 'matchbestgroup.com',
    url: 'https://matchbestgroup.com',
    color: 'bg-green-500'
  },
  {
    id: 'cignal',
    name: 'Cignal',
    domain: 'cignal.tv', 
    url: 'https://cignal.tv',
    color: 'bg-purple-500'
  }
]

export default function EmbedExample() {
  const [selectedWebsite, setSelectedWebsite] = useState(WEBSITE_EXAMPLES[0])
  const [customDomain, setCustomDomain] = useState('')
  
  const chatbotUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?websiteId=${selectedWebsite.id}`
    : `http://localhost:3000/?websiteId=${selectedWebsite.id}`

  const customChatbotUrl = typeof window !== 'undefined' && customDomain
    ? `${window.location.origin}/?websiteId=${selectedWebsite.id}&origin=${encodeURIComponent(customDomain)}`


    
    : chatbotUrl

  const iframeCode = `<!-- Embed ${selectedWebsite.name} Chatbot -->
<iframe 
  src="${customDomain ? customChatbotUrl : chatbotUrl}"
  width="400" 
  height="600"
  frameborder="0"
  style="border: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  title="${selectedWebsite.name} Chatbot">
</iframe>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chatbot Embedding Guide</h1>
        <p className="text-gray-600">
          Learn how to embed the multi-tenant chatbot on your website. The chatbot will automatically detect your domain and show the appropriate content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Website Configuration</CardTitle>
              <CardDescription>
                Choose which website configuration you want to embed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {WEBSITE_EXAMPLES.map((website) => (
                <div 
                  key={website.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedWebsite.id === website.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWebsite(website)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${website.color} text-white`}>
                          {website.id}
                        </Badge>
                        <span className="font-medium">{website.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{website.domain}</p>
                    </div>
                    {selectedWebsite.id === website.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Domain (Optional)</CardTitle>
              <CardDescription>
                Specify a custom domain to test cross-origin embedding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy this iframe code to embed the chatbot on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{iframeCode}</pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(iframeCode)}
                className="mt-4 w-full"
              >
                Copy Embed Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={`${selectedWebsite.color} text-white`}>
                  {selectedWebsite.name}
                </Badge>
                Live Preview
              </CardTitle>
              <CardDescription>
                This is how the chatbot will appear when embedded on {selectedWebsite.domain}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <iframe
                  src={customDomain ? customChatbotUrl : chatbotUrl}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  style={{ 
                    border: 'none', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  title={`${selectedWebsite.name} Chatbot Preview`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Automatic Detection</h4>
                <p className="text-sm text-gray-600">
                  The chatbot automatically detects which website it's embedded on using the iframe's origin/referrer headers.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">2. Dynamic Content</h4>
                <p className="text-sm text-gray-600">
                  Based on the detected website, it loads the appropriate data, system prompts, and branding.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">3. Manual Override</h4>
                <p className="text-sm text-gray-600">
                  You can also specify a websiteId parameter in the URL to force a specific configuration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}