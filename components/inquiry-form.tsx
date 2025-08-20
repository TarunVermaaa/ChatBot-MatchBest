'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { ErrorToast } from '@/components/error-toast'
import { MessageSquare } from 'lucide-react'

interface InquiryFormProps {
  inquiryType: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InquiryData) => void
}

interface InquiryData {
  name: string
  email: string
  phone: string
  company: string
  inquiryType: string
  message: string
  plan: string
}

export function InquiryForm({ inquiryType, isOpen, onClose, onSubmit }: InquiryFormProps) {
  const [formData, setFormData] = useState<InquiryData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: inquiryType || 'demo', // Default to demo if not provided
    message: '',
    plan: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update formData when inquiryType changes
  useEffect(() => {
    if (inquiryType) {
      setFormData(prev => ({ ...prev, inquiryType }))
    }
  }, [inquiryType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Debug logging
    console.log('Form submission started with data:', formData)
    console.log('Current inquiryType:', inquiryType)

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!formData.inquiryType.trim()) {
      setError('Please select an inquiry type')
      setLoading(false)
      return
    }

    try {
      console.log('Submitting inquiry data:', formData)
      
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            inquiryType: inquiryType || 'demo',
            message: '',
            plan: ''
          })
        }, 2000)
      } else {
        throw new Error(responseData.error || 'Failed to submit inquiry')
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit inquiry'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getInquiryTitle = (type: string) => {
    switch (type) {
      case 'demo': return 'Request Demo'
      case 'trial': return 'Start Free Trial'
      case 'consultation': return 'Schedule Consultation'
      case 'support': return 'Get Support'
      case 'subscription': return 'Subscribe Now'
      case 'contact': return 'Contact Us'
      case 'other': return 'Other Inquiry'
      default: return 'Contact Us'
    }
  }

  const getInquiryDescription = (type: string) => {
    switch (type) {
      case 'demo': return 'Get a personalized demo of our services and see how we can help you.'
      case 'trial': return 'Start your free trial and experience the best in satellite TV entertainment.'
      case 'consultation': return 'Schedule a consultation with our experts to find the perfect plan for you.'
      case 'support': return 'Get technical support and assistance with your service.'
      case 'subscription': return 'Subscribe and enjoy premium entertainment at home.'
      case 'contact': return 'Get in touch with us for general inquiries and information.'
      case 'other': return 'Let us know how we can help you with your specific needs.'
      default: return 'Get in touch with us for any questions or assistance.'
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Thank You!</h3>
              <p className="text-gray-600">Your inquiry has been submitted successfully. We'll get back to you soon!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span>{getInquiryTitle(inquiryType)}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {getInquiryDescription(inquiryType)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden field to ensure inquiryType is always included */}
          <input type="hidden" name="inquiryType" value={formData.inquiryType} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Inquiry Type *</label>
            <Select 
              value={formData.inquiryType} 
              onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
            >
              <SelectTrigger className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select inquiry type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 912 345 6789"
                className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Your company"
                className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {(inquiryType === 'subscription' || inquiryType === 'consultation') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Plan</label>
              <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                <SelectTrigger className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan-290">Plan 290 (15 HD + 78 SD)</SelectItem>
                  <SelectItem value="plan-520">Plan 520 (26 HD + 89 SD)</SelectItem>
                  <SelectItem value="plan-720">Plan 720 (28 HD + 94 SD)</SelectItem>
                  <SelectItem value="plan-1050">Plan 1050 (30 HD + 96 SD)</SelectItem>
                  <SelectItem value="plan-1350">Plan 1350 (31 HD + 99 SD)</SelectItem>
                  <SelectItem value="plan-1650">Plan 1650 (32 HD + 101 SD)</SelectItem>
                  <SelectItem value="plan-1990">Plan 1990 (32 HD + 102 SD)</SelectItem>
                  <SelectItem value="prepaid-100">Prepaid 100 SD</SelectItem>
                  <SelectItem value="prepaid-200">Prepaid 200 SD</SelectItem>
                  <SelectItem value="prepaid-300">Prepaid 300 SD</SelectItem>
                  <SelectItem value="prepaid-500">Prepaid 500 SD</SelectItem>
                  <SelectItem value="prepaid-1000">Prepaid 1000 SD</SelectItem>
                  <SelectItem value="not-sure">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us more about your requirements..."
              rows={3}
              className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Error Toast */}
      <ErrorToast error={error} onClose={() => setError(null)} />
    </Dialog>
  )
} 
//o