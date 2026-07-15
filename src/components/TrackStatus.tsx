'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Download, Clock, User, CreditCard, AlertCircle, CheckCircle2, Loader2, ArrowRight, FileDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface TrackData {
  token: string
  name: string
  pan: string
  status: string
  statusLabel: string
  statusColor: string
  statusBgColor: string
  createdAt: string
  notes: string | null
  documents: { id: string; fileName: string; fileType: string; uploadedAt: string }[]
  adminFiles: { id: string; fileName: string; description: string; uploadedAt: string }[]
}

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

const STEPS = [
  { key: 'PROCESSING', label: 'Processing', color: '#3b82f6' },
  { key: 'QUERY_PENDING', label: 'Query', color: '#eab308' },
  { key: 'FILED', label: 'Filed', color: '#f97316' },
  { key: 'VERIFIED', label: 'Verified', color: '#10b981' },
  { key: 'COMPLETED', label: 'Completed', color: '#22c55e' },
]

interface TrackStatusProps {
  initialToken?: string
}

export default function TrackStatus({ initialToken }: TrackStatusProps) {
  const { toast } = useToast()
  const [token, setToken] = useState(initialToken || '')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TrackData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (initialToken) handleTrack()
  }, [initialToken])

  const handleTrack = async () => {
    if (!token.trim()) {
      toast({ title: 'Error', description: 'Please enter a token number', variant: 'destructive' })
      return
    }

    setLoading(true)
    setNotFound(false)
    setData(null)

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })

      let result: Record<string, unknown>
      try {
        result = await res.json()
      } catch {
        toast({ title: 'Server Error', description: 'Invalid response from server. Please try again.', variant: 'destructive' })
        return
      }

      if (!res.ok) {
        setNotFound(true)
        toast({ title: 'Not Found', description: result.error as string, variant: 'destructive' })
        return
      }

      setData(result as unknown as TrackData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case 'QUERY_PENDING':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      default:
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    }
  }

  const getStatusPulse = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return 'status-pulse-green'
      case 'QUERY_PENDING':
        return 'status-pulse-yellow'
      default:
        return 'status-pulse-blue'
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === (data?.status || 'PROCESSING'))

  const handleDownload = (fileId: string) => {
    window.open(`/api/admin/download-client-file?fileId=${fileId}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Search Card */}
      <Card className="border-emerald-100 shadow-md overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Track Your ITR Status</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Enter the token you received after submission</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          <Label className="text-slate-700 font-medium">Token Number</Label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="e.g. ITR-A1B2-C3D4"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                className="pl-10 font-mono text-lg tracking-wider"
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={handleTrack} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 shadow-md shadow-emerald-500/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Track
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Not Found */}
      <AnimatePresence>
        {notFound && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
              <CardContent className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                </motion.div>
                <p className="text-red-700 font-semibold">No record found with this token</p>
                <p className="text-sm text-red-500 mt-1">Please double-check your token and try again</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Status Hero Card */}
            <Card className="border-blue-100 shadow-lg overflow-hidden">
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">Tracking Token</p>
                    <p className="text-2xl sm:text-3xl font-black font-mono tracking-wider">{data.token}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">Submitted On</p>
                    <p className="font-semibold text-lg">
                      {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8">
                {/* Step Progress */}
                <div className="mb-8">
                  <div className="flex justify-between relative">
                    {/* Background line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-slate-100 rounded-full" />
                    {/* Progress line */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      className="absolute top-4 left-4 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    />
                    {STEPS.map((step, i) => {
                      const isCompleted = i <= currentStepIndex
                      const isCurrent = i === currentStepIndex
                      return (
                        <div key={step.key} className="relative flex flex-col items-center z-10 flex-1">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{
                              scale: isCurrent ? [1, 1.15, 1] : 1,
                              opacity: 1,
                            }}
                            transition={isCurrent ? { delay: 0.5, duration: 0.6 } : { delay: 0.3 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                          >
                            {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : (i + 1)}
                          </motion.div>
                          <p className={`text-[10px] mt-2 font-medium ${isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 mb-6"
                >
                  {getStatusIcon(data.status)}
                  <span className={`px-5 py-2.5 rounded-full text-sm font-bold border ${data.statusBgColor} ${data.statusColor} ${getStatusPulse(data.status)}`}>
                    {data.statusLabel}
                  </span>
                </motion.div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Name</p>
                      <p className="font-semibold text-slate-800">{data.name}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">PAN</p>
                      <p className="font-semibold font-mono text-slate-800">{data.pan}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Client Notes */}
                {data.notes && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-200"
                  >
                    <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wider">Your Notes</p>
                    <p className="text-sm text-amber-900">{data.notes}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Admin Uploaded Files — SHOWN FIRST with prominence */}
            {data.adminFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Card className="border-emerald-200 shadow-md overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50/80 border-b border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <FileDown className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Filed Forms & Acknowledgements</CardTitle>
                        <p className="text-xs text-emerald-600">Download your filed documents</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-4">
                    {data.adminFiles.map((file, i) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + i * 0.05 }}
                        className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{file.fileName}</p>
                          {file.description && <p className="text-xs text-slate-500">{file.description}</p>}
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm"
                            onClick={() => handleDownload(file.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Uploaded Documents */}
            {data.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Card className="border-blue-100 shadow-md overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <FileText className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-800">Your Uploaded Documents ({data.documents.length})</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pt-3">
                    {data.documents.map((doc, i) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + i * 0.03 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50/50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold uppercase tracking-wider">
                              {formatDocType(doc.fileType)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}