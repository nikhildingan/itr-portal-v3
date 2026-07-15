'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Shield, Menu, X, ArrowRight, Sparkles, ChevronRight, FileCheck, Send } from 'lucide-react'
import SubmitForm from '@/components/SubmitForm'
import TrackStatus from '@/components/TrackStatus'
import AdminPanel from '@/components/AdminPanel'

type View = 'home' | 'submit' | 'track' | 'admin'

function getInitialView(): { view: View; initialToken: string | undefined } {
  if (typeof window === 'undefined') return { view: 'home', initialToken: undefined }
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const action = params.get('action')
  if (token && action === 'track') return { view: 'track', initialToken: token }
  return { view: 'home', initialToken: undefined }
}

export default function HomePage() {
  const [initialView] = useState(getInitialView)
  const [view, setView] = useState<View>(initialView.view)
  const [initialToken] = useState<string | undefined>(initialView.initialToken)
  const [menuOpen, setMenuOpen] = useState(false)

  const switchView = (v: View) => {
    setView(v)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isHome = view === 'home'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => switchView('home')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-extrabold text-sm tracking-tight">TMI</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent leading-tight">ITR Filing Portal</h1>
                <p className="text-[11px] text-blue-400 font-medium">by TaxMattersIndia</p>
              </div>
            </motion.div>

            {/* Hamburger Menu (Admin) */}
            <div className="flex items-center gap-2">
              {!isHome && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => switchView('home')}
                  className="hidden sm:flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Home
                </motion.button>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all"
                >
                  <motion.div animate={menuOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ duration: 0.2 }}>
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-blue-500/10 border border-blue-100 overflow-hidden z-50"
                      >
                        <div className="p-2">
                          <button
                            onClick={() => switchView('admin')}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">Admin Panel</p>
                              <p className="text-xs text-slate-400">Manage clients</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 w-full">
        {/* HOME VIEW — Two big action cards */}
        {isHome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
          >
            {/* Hero Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-14"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium mb-5"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                Secure & Trusted ITR Filing
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                File Your ITR with
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent"> Confidence</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Submit your documents, track your filing status in real-time, and let TaxMattersIndia handle the rest.
              </p>
            </motion.div>

            {/* Two Big Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Submit Documents Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => switchView('submit')}
                className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-shadow duration-500"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/[0.03] rounded-full" />

                <div className="relative p-7 sm:p-9">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-5"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Send className="w-7 h-7 text-white" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Submit Documents</h2>
                  <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed mb-6">
                    Upload your ITR documents securely. Get an instant tracking token to monitor progress.
                  </p>
                  <div className="flex items-center gap-2 text-white/90 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    Start Filing
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>

              {/* Track Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.5, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => switchView('track')}
                className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/15 hover:shadow-xl hover:shadow-emerald-500/25 transition-shadow duration-500"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-white/[0.03] rounded-full" />

                <div className="relative p-7 sm:p-9">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-5"
                    whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Search className="w-7 h-7 text-white" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Track Status</h2>
                  <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-6">
                    Enter your tracking token to check real-time ITR filing status and download documents.
                  </p>
                  <div className="flex items-center gap-2 text-white/90 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    Track Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-6 sm:gap-10"
            >
              {[
                { icon: <Shield className="w-5 h-5" />, label: 'Secure Upload' },
                { icon: <FileCheck className="w-5 h-5" />, label: 'Real-time Tracking' },
                { icon: <Sparkles className="w-5 h-5" />, label: 'Expert Filing' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="text-blue-500">{item.icon}</div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* SUBMIT / TRACK / ADMIN VIEWS */}
        {!isHome && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Breadcrumb + Back */}
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => switchView('home')} className="text-blue-500 hover:text-blue-700 font-medium transition-colors">
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-700 font-medium">
                  {view === 'submit' && 'Submit Documents'}
                  {view === 'track' && 'Track Status'}
                  {view === 'admin' && 'Admin Panel'}
                </span>
              </div>
            </motion.div>

            {/* View Title */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                  view === 'submit' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                  view === 'track' ? 'bg-gradient-to-br from-emerald-500 to-teal-700' :
                  'bg-gradient-to-br from-slate-600 to-slate-800'
                }`}>
                  {view === 'submit' && <FileText className="w-5 h-5 text-white" />}
                  {view === 'track' && <Search className="w-5 h-5 text-white" />}
                  {view === 'admin' && <Shield className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {view === 'submit' && 'Submit Documents'}
                    {view === 'track' && 'Track Your ITR Status'}
                    {view === 'admin' && 'Admin Panel'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {view === 'submit' && 'Submit your ITR filing information and documents'}
                    {view === 'track' && 'Enter your token to check real-time filing status'}
                    {view === 'admin' && 'Manage client submissions and update filing status'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* View Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {view === 'submit' && <SubmitForm onSubmit={() => {}} />}
                {view === 'track' && <TrackStatus initialToken={initialToken} />}
                {view === 'admin' && <AdminPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-blue-100/80 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontSize: '7px' }}>TMI</span>
              </div>
              <span className="text-sm text-slate-500">
                Powered by <strong className="text-blue-600 font-semibold">TaxMattersIndia</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400">Secure Income Tax Return Filing Services</p>
          </div>
        </div>
      </footer>
    </div>
  )
}