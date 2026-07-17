'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, Users, Download, Trash2, Upload, RefreshCw,
  Search, ChevronDown, ChevronUp, FileText, Clock, Mail, Phone,
  CreditCard, X, AlertTriangle, CheckCircle2, Eye, Loader2,
  Building2, Landmark, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ClientDoc {
  id: string
  fileName: string
  fileType: string
  uploadedAt: string
}

interface AdminFile {
  id: string
  fileName: string
  description: string | null
  uploadedAt: string
}

interface Client {
  id: string
  token: string
  name: string
  phone: string
  email: string
  pan: string
  isFirstTimeFiling: boolean
  aadharNumber: string | null
  bankName: string | null
  ifscCode: string | null
  accountNumber: string | null
  status: string
  statusLabel: string
  statusColor: string
  statusBgColor: string
  createdAt: string
  updatedAt: string
  notes: string | null
  documentCount: number
  documents: ClientDoc[]
  adminFiles: AdminFile[]
}

const STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 border-blue-400 text-blue-800', dot: 'bg-blue-500' },
  { value: 'QUERY_PENDING', label: 'Query Pending', color: 'bg-yellow-100 border-yellow-400 text-yellow-800', dot: 'bg-yellow-500' },
  { value: 'FILED', label: 'Filed', color: 'bg-orange-100 border-orange-400 text-orange-800', dot: 'bg-orange-500' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-emerald-100 border-emerald-400 text-emerald-800', dot: 'bg-emerald-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 border-green-500 text-green-800', dot: 'bg-green-600' },
]

function formatDocType(type: string): string {
  const map: Record<string, string> = {
    PAN_CARD: 'PAN Card',
    AADHAR_CARD: 'Aadhar Card',
    FORM_16: 'Form 16',
    SALARY_SLIPS: 'Salary Slips',
    SHARE_TRADING: 'Share Trading',
    MF_CAPITAL_GAIN: 'MF / Capital Gain',
    OTHER_DEDUCTIONS: 'Deductions',
    HOUSE_LOAN: 'House Loan',
    TCS_TDS: 'TCS / TDS',
    BANK_STATEMENT: 'Bank Statement',
    OTHERS: 'Others',
    ITR_DOC: 'ITR Document',
  }
  return map[type] || type
}

export default function AdminPanel() {
  const { toast } = useToast()
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadModalId, setUploadModalId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients')
      const data = await res.json()
      if (res.ok) setClients(data.clients)
      else toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleLogin = async () => {
    setAuthLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setAuthed(true)
        fetchClients()
      } else {
        toast({ title: 'Login Failed', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setAuthLoading(false)
    }
  }

  const updateStatus = async (clientId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, status }),
      })
      if (res.ok) {
        setClients((prev) =>
          prev.map((c) => {
            if (c.id !== clientId) return c
            const opt = STATUS_OPTIONS.find((s) => s.value === status)
            return { ...c, status, statusLabel: opt?.label || status, statusColor: opt?.color || '', statusBgColor: opt?.color || '' }
          })
        )
        toast({ title: 'Status Updated', description: `Status changed to ${STATUS_OPTIONS.find((s) => s.value === status)?.label}` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/admin/client/${clientId}`, { method: 'DELETE' })
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== clientId))
        setDeleteConfirmId(null)
        setExpandedId(null)
        toast({ title: 'Deleted', description: 'Client record deleted successfully' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleFileUpload = async (clientId: string) => {
    const input = fileInputRef.current
    if (!input || !input.files || input.files.length === 0) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('clientId', clientId)
      formData.append('description', uploadDesc || 'Filed form')
      Array.from(input.files).forEach((f) => formData.append('files', f))

      const res = await fetch('/api/admin/upload-files', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        toast({ title: 'Files Uploaded', description: `${data.files.length} file(s) uploaded` })
        setUploadModalId(null)
        setUploadDesc('')
        fetchClients()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' })
    } finally {
      setUploadLoading(false)
    }
  }

  const downloadZip = (clientId: string) => {
    window.open(`/api/admin/download-zip?clientId=${clientId}`, '_blank')
  }

  const downloadClientFile = (fileId: string) => {
    window.open(`/api/admin/download-client-file?fileId=${fileId}`, '_blank')
  }

  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this uploaded form?')) return
    setDeletingFileId(fileId)
    try {
      const res = await fetch('/api/admin/delete-admin-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      })
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Uploaded form removed successfully' })
        setClients(prev => prev.map(c => ({
          ...c,
          adminFiles: c.adminFiles.filter(f => f.id !== fileId)
        })))
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setDeletingFileId(null)
    }
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.token.toLowerCase().includes(search.toLowerCase()) ||
      c.pan.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  // Login Screen
  if (!authed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md border-blue-200 shadow-xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4"
            >
              <Shield className="w-8 h-8 text-blue-600" />
            </motion.div>
            <CardTitle className="text-2xl text-blue-900">Admin Login</CardTitle>
            <p className="text-sm text-slate-500">Enter credentials to access the admin panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Username</Label>
              <Input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Password</Label>
              <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <Button onClick={handleLogin} disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Dashboard
  const statusCounts = STATUS_OPTIONS.map((s) => ({
    ...s,
    count: clients.filter((c) => c.status === s.value).length,
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Manage all ITR client submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchClients} disabled={loading} className="border-blue-200">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setAuthed(false)} className="border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusCounts.map((s, i) => (
          <motion.div
            key={s.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border-2 ${s.color} text-center cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => setSearch(s.label.toLowerCase())}
          >
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Total */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, token, PAN, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-slate-500 whitespace-nowrap">
          <Users className="w-4 h-4 inline mr-1" />
          {filtered.length} of {clients.length} clients
        </p>
      </div>

      {/* Client List */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-slate-500 mt-3">Loading clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No clients found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
            >
              <Card className="border-blue-100 shadow-sm hover:shadow-md transition-all">
                {/* Client Row */}
                <div
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center gap-3"
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold shrink-0">
                        {client.token}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-800 truncate">{client.name}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500">
                        {new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${client.statusBgColor} ${client.statusColor}`}>
                      {client.statusLabel}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      {client.documentCount} docs
                    </span>
                    {expandedId === client.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === client.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-blue-50 p-4 space-y-4 bg-slate-50/50">
                        {/* Client Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">Email</p>
                              <p className="text-xs font-medium text-slate-700 truncate">{client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">Phone</p>
                              <p className="text-xs font-medium text-slate-700">{client.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">PAN</p>
                              <p className="text-xs font-mono font-medium text-slate-700">{client.pan}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">First Time Filing</p>
                              <p className="text-xs font-medium text-slate-700">{client.isFirstTimeFiling ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>

                        {/* First time filing details */}
                        {client.isFirstTimeFiling && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                              <CreditCard className="w-4 h-4 text-blue-500" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-400">Aadhar</p>
                                <p className="text-xs font-medium text-slate-700">{client.aadharNumber || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-400">Bank</p>
                                <p className="text-xs font-medium text-slate-700">{client.bankName || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                              <Landmark className="w-4 h-4 text-blue-500" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-400">IFSC</p>
                                <p className="text-xs font-mono font-medium text-slate-700">{client.ifscCode || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                              <CreditCard className="w-4 h-4 text-blue-500" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-400">Account No.</p>
                                <p className="text-xs font-mono font-medium text-slate-700">{client.accountNumber || '-'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Client Notes */}
                        {client.notes && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Client Notes</p>
                            <p className="text-xs text-amber-900">{client.notes}</p>
                          </div>
                        )}

                        {/* Status Update */}
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s.value}
                                onClick={() => updateStatus(client.id, s.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all hover:scale-105 ${
                                  client.status === s.value ? s.color + ' ring-2 ring-offset-1' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <span className={`inline-block w-2 h-2 rounded-full ${s.dot} mr-1.5`} />
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Documents */}
                        {client.documents.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Client Documents ({client.documents.length})</p>
                            <div className="space-y-1">
                              {client.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
                                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="flex-1 truncate text-slate-700">{doc.fileName}</span>
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{formatDocType(doc.fileType)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin Uploaded Files */}
                        {client.adminFiles.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Uploaded Forms ({client.adminFiles.length})</p>
                            <div className="space-y-1">
                              {client.adminFiles.map((f) => (
                                <div key={f.id} className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
                                  <FileText className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  <span className="flex-1 truncate text-slate-700">{f.fileName}</span>
                                  {f.description && <span className="text-slate-400 truncate max-w-[120px]">{f.description}</span>}
                                  <button onClick={() => downloadClientFile(f.id)} className="text-blue-500 hover:text-blue-700 shrink-0" title="Download">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(f.id)}
                                    disabled={deletingFileId === f.id}
                                    className="text-red-400 hover:text-red-600 shrink-0 disabled:opacity-50"
                                    title="Delete this form"
                                  >
                                    {deletingFileId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => downloadZip(client.id)}
                            disabled={client.documentCount === 0}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download ZIP
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => { setUploadModalId(client.id); setUploadDesc('') }}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload Forms
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 ml-auto"
                            onClick={() => setDeleteConfirmId(client.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setUploadModalId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-900">Upload Filed Forms</h3>
                <button onClick={() => setUploadModalId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Description</Label>
                  <Input
                    placeholder="e.g. ITR Acknowledgement, Filed Form"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                  />
                </div>
                <div className="upload-zone rounded-xl p-6 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                  <p className="text-sm text-slate-600">Click to select files</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Images (multiple files allowed)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={() => {}}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setUploadModalId(null)} className="flex-1">Cancel</Button>
                  <Button onClick={() => handleFileUpload(uploadModalId)} disabled={uploadLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Client?</h3>
              <p className="text-sm text-slate-500 mb-6">
                This will permanently delete the client record and all uploaded documents. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">Cancel</Button>
                <Button onClick={() => deleteClient(deleteConfirmId)} className="flex-1 bg-red-600 hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" multiple className="hidden" style={{ display: 'none' }} />
    </motion.div>
  )
}