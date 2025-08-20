'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Mail, Phone, Building, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Play, Settings, Filter, Search } from 'lucide-react'
import { ApprovalDialog } from '@/components/approval-dialog'

interface UserInquiry {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  inquiryType: string
  message?: string
  plan?: string
  status: string
  priority: string
  assignee?: string
  assignedAt?: string
  approvedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  notes?: string
  adminNotes?: string
  estimatedCompletion?: string
  actualCompletion?: string
  followUpDate?: string
  source?: string
  tags?: string
}

export default function Dashboard() {
  const [inquiries, setInquiries] = useState<UserInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<UserInquiry | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiry')
      const data = await response.json()

      // Ensure we always have an array
      if (data && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries)
      } else if (data && Array.isArray(data)) {
        setInquiries(data)
      } else {
        setInquiries([])
        console.warn('No inquiries data received or invalid format:', data)
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      setInquiries([]) // Ensure it's always an array even on error
    } finally {
      setLoading(false)
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const response = await fetch(`/api/inquiry/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchInquiries()
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress': return <Play className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter inquiries based on search and filters
  const filteredInquiries = (inquiries || []).filter(inquiry => {
    if (!inquiry) return false

    const matchesSearch =
      (inquiry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.inquiryType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.message && inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || inquiry.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || inquiry.assignee === assigneeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  // Group inquiries by status
  const pendingInquiries = filteredInquiries.filter(i => i.status === 'pending')
  const approvedInquiries = filteredInquiries.filter(i => i.status === 'approved')
  const inProgressInquiries = filteredInquiries.filter(i => i.status === 'in_progress')
  const completedInquiries = filteredInquiries.filter(i => i.status === 'completed')
  const rejectedInquiries = filteredInquiries.filter(i => i.status === 'rejected')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage user inquiries and workflow</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInquiries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressInquiries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedInquiries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedInquiries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Assignee</label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="john">John Smith</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="mike">Mike Wilson</SelectItem>
                <SelectItem value="lisa">Lisa Brown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Inquiries Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredInquiries.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingInquiries.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressInquiries.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedInquiries.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedInquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <InquiriesList
            inquiries={filteredInquiries}
            onManage={(inquiry) => {
              setSelectedInquiry(inquiry)
              setShowApprovalDialog(true)
            }}
            onDelete={deleteInquiry}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <InquiriesList
            inquiries={pendingInquiries}
            onManage={(inquiry) => {
              setSelectedInquiry(inquiry)
              setShowApprovalDialog(true)
            }}
            onDelete={deleteInquiry}
          />
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <InquiriesList
            inquiries={inProgressInquiries}
            onManage={(inquiry) => {
              setSelectedInquiry(inquiry)
              setShowApprovalDialog(true)
            }}
            onDelete={deleteInquiry}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <InquiriesList
            inquiries={completedInquiries}
            onManage={(inquiry) => {
              setSelectedInquiry(inquiry)
              setShowApprovalDialog(true)
            }}
            onDelete={deleteInquiry}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <InquiriesList
            inquiries={rejectedInquiries}
            onManage={(inquiry) => {
              setSelectedInquiry(inquiry)
              setShowApprovalDialog(true)
            }}
            onDelete={deleteInquiry}
          />
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedInquiry && (
        <ApprovalDialog
          inquiry={selectedInquiry}
          isOpen={showApprovalDialog}
          onClose={() => {
            setShowApprovalDialog(false)
            setSelectedInquiry(null)
          }}
          onUpdate={fetchInquiries}
        />
      )}
    </div>
  )
}

function InquiriesList({
  inquiries,
  onManage,
  onDelete
}: {
  inquiries: UserInquiry[]
  onManage: (inquiry: UserInquiry) => void
  onDelete: (id: string) => void
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress': return <Play className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No inquiries found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(inquiry.status)}
                <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                <Badge className={getStatusColor(inquiry.status)}>
                  {inquiry.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(inquiry.priority)}>
                  {inquiry.priority}
                </Badge>
                {inquiry.assignee && (
                  <Badge variant="outline">
                    Assigned: {inquiry.assignee}
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onManage(inquiry)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(inquiry.id)}>
                  Delete
                </Button>
              </div>
            </div>
            <CardDescription>
              {inquiry.inquiryType} • {formatDate(inquiry.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{inquiry.email}</span>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{inquiry.phone}</span>
                  </div>
                )}
                {inquiry.company && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{inquiry.company}</span>
                  </div>
                )}
                {inquiry.plan && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Plan: {inquiry.plan}</span>
                  </div>
                )}
              </div>
              <div>
                {inquiry.message && (
                  <div>
                    <p className="text-sm font-medium mb-1">Message:</p>
                    <p className="text-sm text-gray-600">{inquiry.message}</p>
                  </div>
                )}
                {inquiry.adminNotes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-600">{inquiry.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 