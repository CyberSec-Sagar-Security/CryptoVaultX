import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../../services/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🚀 Attempting login with AuthProvider:', { email: formData.email })
      
      await login({
        email: formData.email,
        password: formData.password
      })
      
      console.log('✅ Login successful via AuthProvider')
      setError('🎉 Login successful! Redirecting to dashboard...')
      
      // Navigate immediately since AuthProvider handles state
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
      
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
       {/* Logo & Brand */}
<div className="text-center space-y-3 -mt-4">
  {/* ⬆️ reduced spacing and nudged upward */}
  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl shadow-lg">
    <Shield className="w-10 h-10 text-white" />
  </div>
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      CryptoVaultX
    </h1>
    <p className="text-gray-400 text-sm">Secure • Encrypted • Private</p>
  </div>
</div>


        {/* Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your encrypted vault
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 py-6">
              {/* Error/Success Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className={error.includes('successful') ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}>
                    <AlertDescription className="text-white">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder="Enter your password"
                    className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm pt-2">
                {/* <-- Added pt-2 for spacing */}
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="/forgot"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </a>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-6 pb-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </span>
                )}
              </Button>

              <p className="text-center text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create one
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          🔒 End-to-end encrypted • Zero-knowledge architecture
        </div>
      </motion.div>
    </div>
  )
}

export default Login
