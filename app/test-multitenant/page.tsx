'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const WEBSITE_CONFIGS = [
  {
    id: 'akashdth',
    name: 'AkashDTH',
    domain: 'akashdth.com',
    description: "Bangladesh's first Direct-to-Home (DTH) satellite TV provider",
    color: 'bg-blue-500'
  },
  {
    id: 'streamplay',
    name: 'StreamPlay',
    domain: 'streamplay.com', 
    description: 'Streaming platform for entertainment content',
    color: 'bg-red-500'
  },
  {
    id: 'matchbestgroup',
    name: 'MatchBest Group',
    domain: 'matchbestgroup.com',
    description: 'Business consulting and services group',
    color: 'bg-green-500'
  },
  {
    id: 'website3',
    name: 'Website3',
    domain: 'website3.com',
    description: 'Generic website configuration',
    color: 'bg-orange-500'
  },
  {
    id: 'cignal',
    name: 'Cignal',
    domain: 'cignal.tv',
    description: 'Digital satellite television service',
    color: 'bg-purple-500'
  }
]

export default function TestMultiTenant() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testWebsiteDetection = async (websiteId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': `https://${WEBSITE_CONFIGS.find(w => w.id === websiteId)?.domain}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Hello! What services do you offer?'
            }
          ],
          websiteId: websiteId
        })
      })

      const reader = response.body?.getReader()
      let result = ''
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          result += new TextDecoder().decode(value)
        }
      }

      setTestResults(prev => [...prev, {
        website: WEBSITE_CONFIGS.find(w => w.id === websiteId),
        response: result.substring(0, 200) + '...', // First 200 chars
        timestamp: new Date().toLocaleTimeString(),
        success: true
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        website: WEBSITE_CONFIGS.find(w => w.id === websiteId),
        response: `Error: ${error}`,
        timestamp: new Date().toLocaleTimeString(),
        success: false
      }])
    }
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Tenant Chatbot Test</h1>
        <p className="text-gray-600">
          Test the chatbot with different website configurations to verify it responds with website-specific data and prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {WEBSITE_CONFIGS.map((website) => (
          <Card key={website.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{website.name}</CardTitle>
                <Badge className={`${website.color} text-white`}>
                  {website.id}
                </Badge>
              </div>
              <CardDescription>{website.description}</CardDescription>
              <p className="text-sm text-blue-600">{website.domain}</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testWebsiteDetection(website.id)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Chat'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Test Results</h2>
        <Button variant="outline" onClick={clearResults}>
          Clear Results
        </Button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={`${result.success ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={`${result.website?.color} text-white`}>
                    {result.website?.name}
                  </Badge>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </CardTitle>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'Success' : 'Error'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{result.response}</pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No test results yet. Click "Test Chat" on any website configuration above to start testing.
          </CardContent>
        </Card>
      )}
    </div>
  )
}