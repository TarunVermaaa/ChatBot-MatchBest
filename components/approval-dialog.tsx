'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, Play, Settings } from 'lucide-react'
import { ErrorToast } from '@/components/error-toast'

interface ApprovalDialogProps {
  inquiry: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

interface WorkflowLog {
  id: string
  action: string
  performedBy: string
  details: string
  createdAt: string
}

export function ApprovalDialog({ inquiry, isOpen, onClose, onUpdate }: ApprovalDialogProps) {
  const [action, setAction] = useState('')
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState('')
  const [estimatedCompletion, setEstimatedCompletion] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<WorkflowLog[]>([])

  // Sample team members (in real app, fetch from API)
  const teamMembers = [
    { id: 'john', name: 'John Smith', role: 'Sales Manager' },
    { id: 'sarah', name: 'Sarah Johnson', role: 'Customer Support' },
    { id: 'mike', name: 'Mike Wilson', role: 'Technical Specialist' },
    { id: 'lisa', name: 'Lisa Brown', role: 'Account Manager' }
  ]

  useEffect(() => {
    if (isOpen && inquiry) {
      fetchWorkflowLogs()
      setAssignee(inquiry.assignee || '')
      setPriority(inquiry.priority || 'medium')
      setAdminNotes(inquiry.adminNotes || '')
    }
  }, [isOpen, inquiry])

  const fetchWorkflowLogs = async () => {
    try {
      const response = await fetch(`/api/inquiry/${inquiry.id}/logs`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching workflow logs:', error)
    }
  }

  const handleAction = async () => {
    if (!action) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inquiry/${inquiry.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          assignee: assignee || undefined,
          priority: priority || undefined,
          estimatedCompletion: estimatedCompletion || undefined,
          adminNotes: adminNotes || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        onUpdate()
        onClose()
        setAction('')
        setAssignee('')
        setPriority('')
        setEstimatedCompletion('')
        setAdminNotes('')
      } else {
        throw new Error(data.error || 'Failed to process action')
      }
    } catch (error) {
      console.error('Error processing action:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process action'
      setError(errorMessage)
    } finally {
      setLoading(false)
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

  if (!inquiry) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(inquiry.status)}
            <span>Manage Inquiry - {inquiry.name}</span>
            <Badge className={getStatusColor(inquiry.status)}>
              {inquiry.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(inquiry.priority)}>
              {inquiry.priority}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Inquiry Type: {inquiry.inquiryType} • Created: {formatDate(inquiry.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inquiry Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Inquiry Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {inquiry.name}</div>
                <div><strong>Email:</strong> {inquiry.email}</div>
                {inquiry.phone && <div><strong>Phone:</strong> {inquiry.phone}</div>}
                {inquiry.company && <div><strong>Company:</strong> {inquiry.company}</div>}
                {inquiry.plan && <div><strong>Plan:</strong> {inquiry.plan}</div>}
                {inquiry.message && (
                  <div>
                    <strong>Message:</strong>
                    <p className="mt-1 text-gray-600">{inquiry.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Current Status</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Status:</strong> {inquiry.status}</div>
                <div><strong>Priority:</strong> {inquiry.priority}</div>
                {inquiry.assignee && <div><strong>Assigned to:</strong> {inquiry.assignee}</div>}
                {inquiry.assignedAt && <div><strong>Assigned at:</strong> {formatDate(inquiry.assignedAt)}</div>}
                {inquiry.approvedAt && <div><strong>Approved at:</strong> {formatDate(inquiry.approvedAt)}</div>}
                {inquiry.completedAt && <div><strong>Completed at:</strong> {formatDate(inquiry.completedAt)}</div>}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Workflow */}
          <div className="space-y-4">
            {/* Action Panel */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Take Action</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve Inquiry</SelectItem>
                      <SelectItem value="reject">Reject Inquiry</SelectItem>
                      <SelectItem value="assign">Assign to Team Member</SelectItem>
                      <SelectItem value="complete">Mark as Completed</SelectItem>
                      <SelectItem value="update">Update Details</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(action === 'assign' || action === 'approve' || action === 'update') && (
                  <div>
                    <label className="text-sm font-medium">Assign to</label>
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Estimated Completion</label>
                  <Input
                    type="datetime-local"
                    value={estimatedCompletion}
                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleAction} 
                  disabled={!action || loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : `Execute ${action}`}
                </Button>
              </div>
            </div>

            {/* Workflow Logs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Workflow History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-500">No workflow logs yet</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-sm border-l-2 border-blue-200 pl-3">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-gray-600">{log.details}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(log.createdAt)} by {log.performedBy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Toast */}
        <ErrorToast error={error} onClose={() => setError(null)} />
      </DialogContent>
    </Dialog>
  )
} 