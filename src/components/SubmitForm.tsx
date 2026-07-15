'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, X, User, Phone, Mail, CreditCard, Lock,
  Building2, Landmark, Hash, AlertCircle, Receipt,
  Banknote, TrendingUp, PieChart, Home, FileCheck, FilePlus, Briefcase, MessageSquare,
  Sparkles, ArrowRight, CheckCircle2, PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface SubmitFormProps {
  onSubmit: (token: string) => void
}

interface FileCategory {
  key: string
  label: string
  description: string
  icon: React.ReactNode
  accept: string
  gradient: string
}

const DOCUMENT_CATEGORIES: FileCategory[] = [
  { key: 'FORM_16', label: 'Form 16', description: 'Employer-issued TDS certificate', icon: <Receipt className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-blue-500 to-blue-600' },
  { key: 'SALARY_SLIPS', label: 'Salary Slips', description: 'Monthly salary break-up', icon: <Banknote className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-indigo-500 to-indigo-600' },
  { key: 'SHARE_TRADING', label: 'Share Trading Documents', description: 'Trading statements, P&L reports', icon: <TrendingUp className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-violet-500 to-violet-600' },
  { key: 'MF_CAPITAL_GAIN', label: 'MF / Capital Gain Statements', description: 'Mutual fund & capital gain reports', icon: <PieChart className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-purple-500 to-purple-600' },
  { key: 'OTHER_DEDUCTIONS', label: 'Other Deduction Documents', description: '80C, 80D, HRA, LTA, etc.', icon: <FileCheck className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-cyan-500 to-cyan-600' },
  { key: 'HOUSE_LOAN', label: 'House Loan Documents', description: 'Loan certificate, interest certificate', icon: <Home className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-teal-500 to-teal-600' },
  { key: 'TCS_TDS', label: 'TCS / TDS Documents', description: 'Tax collected at source certificates', icon: <Briefcase className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx', gradient: 'from-amber-500 to-amber-600' },
  { key: 'BANK_STATEMENT', label: 'Bank Statement', description: 'Annual bank statement for all accounts', icon: <Landmark className="w-4 h-4" />, accept: '.pdf,.csv,.xls,.xlsx', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'OTHERS', label: 'Any Other Documents', description: 'Any additional documents for filing', icon: <FilePlus className="w-4 h-4" />, accept: '.pdf,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx', gradient: 'from-slate-500 to-slate-600' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function SubmitForm({ onSubmit }: SubmitFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [submittedToken, setSubmittedToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [pan, setPan] = useState('')
  const [portalPassword, setPortalPassword] = useState('')
  const [aadharNumber, setAadharNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [notes, setNotes] = useState('')

  const [files, setFiles] = useState<Record<string, File[]>>({})
  const fileInputId = (cat: string) => `file-input-${cat}`

  const triggerUpload = (cat: string) => {
    const el = document.getElementById(fileInputId(cat)) as HTMLInputElement | null
    if (el) el.click()
  }

  const handleFileChange = (cat: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [cat]: [...(prev[cat] || []), ...Array.from(e.target.files!)],
      }))
    }
    e.target.value = ''
  }

  const handleDrop = (cat: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [cat]: [...(prev[cat] || []), ...Array.from(e.dataTransfer.files)],
      }))
    }
  }

  const removeFile = (cat: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [cat]: (prev[cat] || []).filter((_, i) => i !== index),
    }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) e.phone = 'Enter a valid 10-digit number'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email'
    if (!pan.trim()) e.pan = 'PAN is required'
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())) e.pan = 'Enter a valid PAN (e.g. ABCDE1234F)'
    if (isFirstTime) {
      if (!aadharNumber.trim()) e.aadharNumber = 'Aadhar number is required for first-time filing'
      if (!bankName.trim()) e.bankName = 'Bank name is required'
      if (!ifscCode.trim()) e.ifscCode = 'IFSC code is required'
      if (!accountNumber.trim()) e.accountNumber = 'Account number is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('phone', phone.trim())
      formData.append('email', email.trim())
      formData.append('pan', pan.trim().toUpperCase())
      formData.append('portalPassword', portalPassword)
      formData.append('isFirstTimeFiling', isFirstTime.toString())
      formData.append('notes', notes.trim())

      if (isFirstTime) {
        formData.append('aadharNumber', aadharNumber.trim())
        formData.append('bankName', bankName.trim())
        formData.append('ifscCode', ifscCode.trim().toUpperCase())
        formData.append('accountNumber', accountNumber.trim())
      }

      const allCats = [...DOCUMENT_CATEGORIES, { key: 'PAN_CARD', accept: '' }, { key: 'AADHAR_CARD', accept: '' }]
      for (const cat of allCats) {
        const catFiles = files[cat.key] || []
        for (const f of catFiles) {
          formData.append(`doc_${cat.key}`, f)
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      let data: Record<string, unknown>
      try {
        data = await res.json()
      } catch {
        toast({ title: 'Server Error', description: 'The server returned an invalid response. Please try again.', variant: 'destructive' })
        return
      }

      if (!res.ok) {
        toast({ title: 'Error', description: (data.error as string) || 'Submission failed. Please try again.', variant: 'destructive' })
        return
      }

      setSubmittedToken(data.token as string)
      onSubmit(data.token as string)
      toast({ title: 'Submitted Successfully!', description: `Your token: ${data.token}` })
    } catch (err: unknown) {
      const message = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out. Try with fewer/smaller files.' : err.message)
        : 'Network error. Please check your connection and try again.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    errors[field] ? 'border-red-400 focus-visible:ring-red-400' : ''

  if (submittedToken) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="text-center py-10"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="relative mb-8 inline-block"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </motion.svg>
          </motion.div>
          {/* Sparkle effects */}
          <motion.div
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute -bottom-1 -left-3 w-4 h-4 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute top-2 -left-5 w-3 h-3 bg-pink-400 rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-semibold mb-4">
            <PartyPopper className="w-4 h-4" />
            Submission Successful!
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2"
        >
          Your ITR is in Safe Hands
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 mb-8 max-w-md mx-auto"
        >
          TaxMattersIndia is now processing your filing. A confirmation email with your tracking token has been sent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          <Card className="max-w-md mx-auto border-2 border-blue-200 shadow-xl shadow-blue-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
              <p className="text-blue-100 text-xs uppercase tracking-widest font-semibold text-center">Your Tracking Token</p>
            </div>
            <CardContent className="p-8">
              <p className="text-4xl md:text-5xl font-black text-blue-700 tracking-widest mb-4 font-mono text-center">
                {submittedToken}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Token sent to your registered email</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-slate-400 mt-8"
        >
          Save this token to track your ITR filing status anytime.
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* ── Personal Information ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-blue-100 shadow-md card-hover-lift overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2.5 text-blue-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-700 font-medium">Full Name <span className="text-red-400">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className={`pl-10 ${inputClass('name')}`} />
              </div>
              {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="phone" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`pl-10 ${inputClass('phone')}`} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
              <p className="text-xs text-blue-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Share your number for personalized filing assistance
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email ID <span className="text-red-400">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${inputClass('email')}`} />
              </div>
              {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pan" className="text-slate-700 font-medium">PAN Number <span className="text-red-400">*</span></Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="pan" placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} className={`pl-10 font-mono tracking-wider ${inputClass('pan')}`} />
              </div>
              {errors.pan && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pan}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">ITR Login Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="password" type="password" placeholder="Your Income Tax portal login password (optional)" value={portalPassword} onChange={(e) => setPortalPassword(e.target.value)} className={`pl-10 ${inputClass('portalPassword')}`} />
              </div>
              <p className="text-xs text-slate-400">If you know your Income Tax portal password, share it here for faster filing</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── First Time Filing ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-blue-100 shadow-md card-hover-lift overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-blue-800">First Time Filing</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Enable if this is your first ITR filing</p>
                </div>
              </div>
              <Switch checked={isFirstTime} onCheckedChange={setIsFirstTime} />
            </div>
          </CardHeader>
          <AnimatePresence>
            {isFirstTime && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent className="space-y-4 pt-0 border-t border-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium">Aadhar Number <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input placeholder="Enter Aadhar number" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} className={`pl-10 ${inputClass('aadharNumber')}`} />
                      </div>
                      {errors.aadharNumber && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.aadharNumber}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium">PAN Number (confirmed)</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input placeholder={pan || 'ABCDE1234F'} value={pan} disabled className="pl-10 font-mono bg-slate-50" />
                      </div>
                      <p className="text-xs text-slate-400">Auto-filled from your PAN above</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <UploadBox
                      label="PAN Card"
                      description="Upload PAN card copy"
                      icon={<CreditCard className="w-4 h-4" />}
                      files={files['PAN_CARD'] || []}
                      category="PAN_CARD"
                      accept=".pdf,.jpg,.jpeg,.png"
                      gradient="from-blue-500 to-blue-600"
                      onTrigger={() => triggerUpload('PAN_CARD')}
                      onFileChange={(e) => handleFileChange('PAN_CARD', e)}
                      onDrop={(e) => handleDrop('PAN_CARD', e)}
                      onRemove={(i) => removeFile('PAN_CARD', i)}
                    />
                    <UploadBox
                      label="Aadhar Card"
                      description="Upload Aadhar card copy"
                      icon={<Hash className="w-4 h-4" />}
                      files={files['AADHAR_CARD'] || []}
                      category="AADHAR_CARD"
                      accept=".pdf,.jpg,.jpeg,.png"
                      gradient="from-indigo-500 to-indigo-600"
                      onTrigger={() => triggerUpload('AADHAR_CARD')}
                      onFileChange={(e) => handleFileChange('AADHAR_CARD', e)}
                      onDrop={(e) => handleDrop('AADHAR_CARD', e)}
                      onRemove={(i) => removeFile('AADHAR_CARD', i)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium">Bank Name <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input placeholder="e.g. State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} className={`pl-10 ${inputClass('bankName')}`} />
                      </div>
                      {errors.bankName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bankName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium">IFSC Code <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input placeholder="e.g. SBIN0001234" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} maxLength={11} className={`pl-10 font-mono ${inputClass('ifscCode')}`} />
                      </div>
                      {errors.ifscCode && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.ifscCode}</p>}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-slate-700 font-medium">Account Number <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input placeholder="Enter bank account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} className={`pl-10 ${inputClass('accountNumber')}`} />
                      </div>
                      {errors.accountNumber && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountNumber}</p>}
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ── Document Uploads ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-blue-100 shadow-md overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-b border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-800">Upload Documents</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Upload under relevant categories. Multiple files per category. Accepts PDF, Excel & images.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <UploadBox
                key={cat.key}
                label={cat.label}
                description={cat.description}
                icon={cat.icon}
                files={files[cat.key] || []}
                category={cat.key}
                accept={cat.accept}
                gradient={cat.gradient}
                onTrigger={() => triggerUpload(cat.key)}
                onFileChange={(e) => handleFileChange(cat.key, e)}
                onDrop={(e) => handleDrop(cat.key, e)}
                onRemove={(i) => removeFile(cat.key, i)}
              />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Notes ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-amber-100 shadow-md card-hover-lift overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-amber-800">Additional Notes</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Any specific information or instructions for our team</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              placeholder="E.g., I have income from two employers, or I want to claim deduction under 80C for PPF..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none border-amber-100 focus-visible:ring-amber-300 bg-amber-50/30"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Submit Button ── */}
      <motion.div variants={itemVariants} className="pt-2 pb-4">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 rounded-xl relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-2.5">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit ITR Information
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ── Upload Box Component ── */
function UploadBox({
  label, description, icon, files, category, accept, gradient,
  onTrigger, onFileChange, onDrop, onRemove,
}: {
  label: string
  description: string
  icon: React.ReactNode
  files: File[]
  category: string
  accept: string
  gradient: string
  onTrigger: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent) => void
  onRemove: (index: number) => void
}) {
  const inputId = `file-input-${category}`
  const fileCount = files.length
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 transition-all duration-300 ${
        isDragOver ? 'border-blue-400 bg-blue-50/50 shadow-md shadow-blue-500/10' : 'border-blue-100 bg-white hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-[11px] text-slate-400">{description}</p>
          </div>
        </div>
        {fileCount > 0 && (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold"
          >
            {fileCount} file{fileCount > 1 ? 's' : ''}
          </motion.span>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        className="upload-zone rounded-lg p-3 text-center cursor-pointer"
        onClick={onTrigger}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false) }}
        onDrop={(e) => { setIsDragOver(false); onDrop(e) }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTrigger() } }}
      >
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Upload className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Click or drag files here</span>
        </div>
      </div>

      <input
        id={inputId}
        type="file"
        multiple
        accept={accept}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1">
            {files.map((f, i) => (
              <motion.div
                key={`${category}-${f.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 py-1.5 px-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg text-xs group border border-blue-100/50"
              >
                <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate flex-1 text-slate-700 font-medium">{f.name}</span>
                <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-0.5 hover:bg-red-50 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}