import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

interface FormData {
  name: string
  email: string
  password: string
  confirm: string
  terms: boolean
}

interface PasswordChecks {
  length: boolean
  lower: boolean
  upper: boolean
  number: boolean
  special: boolean
}

interface PasswordStrength {
  label: string
  color: string
  pct: number
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const CHECKS = [
  { key: 'length' as keyof PasswordChecks, label: 'At least 8 characters' },
  { key: 'lower' as keyof PasswordChecks, label: 'Lowercase (a–z)' },
  { key: 'upper' as keyof PasswordChecks, label: 'Uppercase (A–Z)' },
  { key: 'number' as keyof PasswordChecks, label: 'Number (0–9)' },
  { key: 'special' as keyof PasswordChecks, label: 'Special char (!@#$%^&*)' },
]

function evalChecks(pwd: string): PasswordChecks {
  return {
    length: pwd.length >= 8,
    lower: /[a-z]/.test(pwd),
    upper: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*]/.test(pwd),
  }
}

function strengthFrom(checks: PasswordChecks): PasswordStrength {
  const passed = Object.values(checks).filter(Boolean).length
  if (passed <= 2) return { label: 'Weak', color: 'from-red-400 to-red-400', pct: 25 }
  if (passed <= 4) return { label: 'Medium', color: 'from-yellow-400 to-yellow-400', pct: 66 }
  return { label: 'Strong', color: 'from-green-400 to-green-400', pct: 100 }
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '', confirm: '', terms: false })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [checks, setChecks] = useState<PasswordChecks>({ length: false, lower: false, upper: false, number: false, special: false })
  const [strength, setStrength] = useState<PasswordStrength>({ label: '', color: '', pct: 0 })
  const [pwdTouched, setPwdTouched] = useState(false) // whether to show checklist
  const [match, setMatch] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = evalChecks(form.password)
    setChecks(c)
    setStrength(strengthFrom(c))
    // confirm match live
    if (form.confirm.length === 0 && form.password.length === 0) setMatch(null)
    else setMatch(form.password === form.confirm && form.confirm.length > 0)
  }, [form.password, form.confirm])

  // show checklist when user types or focuses
  const onPwdFocus = () => setPwdTouched(true)
  const onPwdBlur = () => { /* keep visible until cleared intentionally */ }

  const updateField = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [k]: v }))
    setMessage(null)
  }

  const canSubmit = () => {
    // Check all password strength requirements
    const passwordStrong = Object.values(checks).every(Boolean)
    
    return (
      form.name.trim().length > 0 &&
      /^\S+@\S+\.\S+$/.test(form.email) &&
      passwordStrong &&
      match === true &&
      form.terms
    )
  }

  const registerRequest = async (payload: { username: string; email: string; password: string }) => {
    console.log('🚀 Attempting registration with:', payload)
    console.log('🌐 API URL:', 'http://localhost:5000/api/auth/register')
    
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    
    console.log('📡 Response status:', res.status)
    console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()))
    
    const json = await res.json().catch(() => ({ error: 'Server error' }))
    console.log('📦 Response data:', json)
    
    if (!res.ok) throw new Error(json.message || json.error || 'Registration failed')
    return json
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    
    console.log('🧪 Registration Debug Info:')
    console.log('Form data:', { name: form.name, email: form.email, password: '***' })
    console.log('Terms accepted:', form.terms)
    console.log('Email valid:', /^\S+@\S+\.\S+$/.test(form.email))
    console.log('Password strength:', strength)
    console.log('Passwords match:', match)
    
    if (!form.terms) { 
      console.log('❌ FAILED: Terms not accepted')
      setMessage({ type: 'error', text: 'Please accept Terms & Privacy.' }); 
      return 
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { 
      console.log('❌ FAILED: Invalid email')
      setMessage({ type: 'error', text: 'Enter a valid email.' }); 
      return 
    }
    if (form.password.length < 8) { 
      console.log('❌ FAILED: Password too short')
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' }); 
      return 
    }
    if (!Object.values(checks).every(Boolean)) { 
      console.log('❌ FAILED: Password does not meet strength requirements')
      setMessage({ type: 'error', text: 'Password must include uppercase, lowercase, number, and special character (!@#$%^&*).' }); 
      return 
    }
    if (match !== true) { 
      console.log('❌ FAILED: Passwords do not match')
      setMessage({ type: 'error', text: 'Passwords do not match.' }); 
      return 
    }

    console.log('✅ All validations passed! Proceeding with registration...')
    setLoading(true)
    try {
      const payload = { username: form.name.trim(), email: form.email.trim(), password: form.password }
      console.log('📤 Sending registration request...')
      await registerRequest(payload)
      console.log('✅ Registration successful!')
      setMessage({ type: 'success', text: 'Registration successful! ✅ Redirecting to login in 3s...' })
      // Redirect to login page after success
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      console.error('❌ Registration error:', err)
      setMessage({ type: 'error', text: err.message || 'Registration failed' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start md:items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center -mt-3 mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl shadow-lg mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2L3 5v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V5l-9-3z" fill="white" opacity="0.12"/>
              <path d="M12 2L3 5v6c0 5 3.7 9.7 9 11 5.3-1.3 9-6 9-11V5l-9-3z" stroke="white" strokeOpacity="0.9" strokeWidth="0.6" fill="none"/>
            </svg>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-white">CryptoVaultX</h1>
          <p className="mt-1 text-sm text-white font-medium">Create your encrypted vault</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
          <form onSubmit={onSubmit}>
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-xl md:text-2xl text-white font-medium">Create Account</CardTitle>
              <CardDescription className="text-sm text-gray-400">Join the future of secure file storage</CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-5 space-y-4">
              {message && (
                <Alert className={message.type === 'success' ? 'border-green-400/20 bg-green-400/8' : 'border-red-400/20 bg-red-400/8'}>
                  <AlertDescription className="text-white">{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-white text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-500" required />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-white text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-500" required />
                </div>
              </div>

              {/* Password (compact) */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-white text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    ref={passwordRef}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={onPwdFocus}
                    onBlur={onPwdBlur}
                    placeholder="Create a strong password"
                    className="pl-10 pr-4 h-11 bg-white/5 border-white/10 text-white placeholder-gray-500"
                    required
                  />
                </div>

                {/* checklist + strength - only show after user started typing */}
                {pwdTouched && form.password.length > 0 && (
                  <div className="mt-3 space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {CHECKS.map((c) => {
                        const ok = checks[c.key]
                        return (
                          <div key={c.key} className="flex items-center gap-3">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                              ok ? 'bg-green-500 text-white shadow-green-500/30 shadow-lg' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {ok ? '✓' : '✗'}
                            </span>
                            <span className={`text-sm font-medium ${ok ? 'text-green-300' : 'text-red-300'}`}>{c.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* strength bar */}
                    <div className="mt-3">
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-3 rounded-full bg-gradient-to-r ${strength.color} shadow-lg`}
                          style={{ width: `${strength.pct}%`, transition: 'width 300ms ease' }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`text-sm font-semibold ${
                          strength.label === 'Weak' ? 'text-red-400' : 
                          strength.label === 'Medium' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          Password Strength: {strength.label || '—'}
                        </span>
                        <span className="text-xs text-gray-400">{strength.pct}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm - only reveal if Strong */}
              {strength.label === 'Strong' ? (
                <div className="space-y-1">
                  <Label htmlFor="confirm" className="text-white text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm your password" className="pl-10 pr-12 h-11 bg-white/5 border-white/10 text-white placeholder-gray-500" required />
                    <button type="button" aria-label="toggle confirm password" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="text-sm mt-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    {form.confirm.length === 0 ? (
                      <span className="text-gray-400 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">i</span>
                        Passwords will match in real-time
                      </span>
                    ) : (form.password === form.confirm ? (
                      <span className="text-green-300 flex items-center gap-2 font-medium">
                        <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                        Passwords match perfectly!
                      </span>
                    ) : (
                      <span className="text-red-300 flex items-center gap-2 font-medium">
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">✗</span>
                        Passwords do not match
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white p-4 bg-amber-500/20 rounded-lg border-2 border-amber-500/40 flex items-center gap-3 shadow-lg">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-amber-500/50 shadow-lg">!</span>
                  <span className="font-semibold">Make your password strong before confirming it.</span>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3 mt-4">
                <input id="terms" type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-0.5 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-2" />
                <label htmlFor="terms" className="text-sm text-white leading-relaxed">
                  I agree to the <a className="text-indigo-400 underline hover:text-indigo-300" href="/terms-of-service" target="_blank">Terms of Service</a> and <a className="text-indigo-400 underline hover:text-indigo-300" href="/privacy-policy" target="_blank">Privacy Policy</a>
                </label>
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-4">
              <div className="w-full space-y-4">
                <Button type="submit" disabled={loading || !canSubmit()} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                {/* DEBUG: Direct API Test Button */}
                <Button 
                  type="button"
                  onClick={async () => {
                    console.log('🚀 Direct API Test - Bypassing all validation')
                    setLoading(true)
                    try {
                      const testPayload = { 
                        username: 'directtest', 
                        email: 'directtest@test.com', 
                        password: 'TestPass123!' 
                      }
                      console.log('📤 Direct API call with:', testPayload)
                      await registerRequest(testPayload)
                      console.log('✅ Direct API call SUCCESS!')
                      setMessage({ type: 'success', text: 'Direct API test successful! ✅' })
                    } catch (err) {
                      console.error('❌ Direct API call FAILED:', err)
                      setMessage({ type: 'error', text: `Direct API failed: ${err.message}` })
                    } finally { 
                      setLoading(false) 
                    }
                  }}
                  className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm"
                >
                  🧪 Test Direct API Call (Debug)
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-white">Already have an account? </span>
                  <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors">Sign in</Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-xs text-gray-500 mt-3">
          🔒 AES-256 Encryption • Zero-knowledge architecture • GDPR Compliant
        </div>
      </motion.div>
    </div>
  )
}
