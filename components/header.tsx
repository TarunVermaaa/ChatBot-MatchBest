'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, BarChart3, Tv, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const [websiteName, setWebsiteName] = useState('AI Assistant')
  const [websiteId, setWebsiteId] = useState<string>('akashdth')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paramWebsiteId = urlParams.get('websiteId')
      if (paramWebsiteId) {
        setWebsiteId(paramWebsiteId)
      }

      const websiteNames: Record<string, string> = {
        'akashdth': 'AkashDTH TV',
        'streamplay': 'StreamPlay',
        'matchbestgroup': 'MatchBest Group',
        'website3': 'Website3',
        'cignal': 'Cignal TV',
        'ava': 'AVA',
        'echef': 'Echef Bot',
        'matchbestsoftware': 'MatchBest Software',
        'traceplus': 'Tracey'
      }

      setWebsiteName(websiteNames[paramWebsiteId || 'akashdth'] || 'AI Assistant')
    }
  }, [])
  return (
    <header className={`sticky top-0 z-50 shadow-lg border-b flex-shrink-0 ${websiteId === 'traceplus'
        ? 'bg-gradient-to-r from-yellow-900 via-yellow-800 to-red-800 border-yellow-600/20'
        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 border-blue-500/20'
      }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center space-x-3">
            <Link href="" className="flex items-center space-x-3 group">
              {websiteId === 'traceplus' ? (
                // Trace+ Logo
                <div className="relative flex-shrink-0">
                  <img
                    src="/tracepluslogo.png"
                    alt="Trace+ Logo"
                    className="h-8 w-auto group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              ) : (
                // Default TV Icon for other websites
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-yellow-800" />
                  </div>
                </div>
              )}
              <div className="flex-shrink-0">
                <span className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors leading-tight">
                  {websiteName}
                </span>
                <div className="text-xs text-blue-100/80 leading-tight">AI Assistant</div>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-2 flex-shrink-0">
            <Link href="/">
              {/* <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-white hover:text-blue-100 hover:bg-white/10 rounded-lg transition-all duration-200 h-9 px-3"
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-sm">Chat Assistant</span>
              </Button> */}
            </Link>
            <Link href="/dashboard">
              {/* <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-white hover:text-blue-100 hover:bg-white/10 rounded-lg transition-all duration-200 h-9 px-3"
              >
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-sm">Dashboard</span>
              </Button> */}
            </Link>
            <div className="hidden sm:flex items-center space-x-2 ml-3 pl-3 border-l border-white/20">
              <div className="flex items-center space-x-1 text-xs text-blue-100/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                <span>Live</span>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
} 