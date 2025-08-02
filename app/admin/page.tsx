'use client'

import { useState, useEffect } from 'react'
import AdminOrdersDashboard from './AdminOrdersDashboard'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const ADMIN_CREDENTIALS = [
  { email: 'inreluxe@gmail.com', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'reluxe&2025' },
  { email: 'killerfake8@gmail.com', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'anujayasekara730' },
   { email: 'Netharadilmina07@gmail.com', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Nethara@1115' },
]

const MAX_ATTEMPTS = 4
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtpField, setShowOtpField] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockout, setLockout] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)

  // Handle lockout timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (lockout && lockoutTime > 0) {
      interval = setInterval(() => {
        const now = Date.now()
        const diff = lockoutTime - now
        setRemainingTime(Math.max(0, diff))
        
        if (diff <= 0) {
          setLockout(false)
          setAttempts(0)
          if (interval) clearInterval(interval)
        }
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lockout, lockoutTime])

  const handleSendOtp = async () => {
    if (lockout) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setGeneratedOtp(data.otp)
      setOtpSent(true)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (lockout) {
      setError(`Too many attempts. Please try again in ${Math.ceil(remainingTime / 1000 / 60)} minutes.`)
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const isValidAdmin = ADMIN_CREDENTIALS.some(
        cred => cred.email === email && cred.password === password
      )

      if (!isValidAdmin) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION
          setLockout(true)
          setLockoutTime(lockoutTime)
          setError(`Too many attempts. Account locked for ${LOCKOUT_DURATION / 1000 / 60} minutes.`)
          return
        }
        
        setError(`Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
        return
      }

      if (!showOtpField) {
        await handleSendOtp()
        setShowOtpField(true)
        return
      }

      if (otp !== generatedOtp) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION
          setLockout(true)
          setLockoutTime(lockoutTime)
          setError(`Too many attempts. Account locked for ${LOCKOUT_DURATION / 1000 / 60} minutes.`)
          return
        }
        
        setError(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
        return
      }

      // Successful authentication
      setAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  if (authenticated) {
    return <AdminOrdersDashboard />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            {showOtpField ? 'OTP Verification' : 'Admin Portal'}
          </CardTitle>
          <CardDescription className="text-center">
            {showOtpField 
              ? `Enter the 6-digit code sent to ${email}` 
              : 'Restricted access. Authorized personnel only.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && (
              <Alert variant={lockout ? "destructive" : "default"}>
                <AlertDescription>
                  {error}
                  {lockout && (
                    <div className="mt-2">
                      Time remaining: {Math.floor(remainingTime / 1000 / 60)}:
                      {(remainingTime / 1000 % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!showOtpField ? (
              <>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <label htmlFor="email" className="text-sm font-medium">
                      Admin Email
                    </label>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nethara@modaya.com"
                    required
                    className="h-10"
                    disabled={lockout}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10"
                    disabled={lockout}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <label htmlFor="otp" className="text-sm font-medium">
                      OTP Code
                    </label>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 6) setOtp(value)
                    }}
                    placeholder="123456"
                    required
                    className="h-10 text-center tracking-widest"
                    autoFocus
                    disabled={lockout}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your email for the 6-digit code
                  </p>
                </div>

                {!lockout && (
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || otpSent}
                      className="text-primary underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      {otpSent ? 'OTP sent' : 'Resend OTP'}
                    </button>
                  </div>
                )}
              </>
            )}
            
            <Button 
              type="submit"
              disabled={loading || lockout || 
                (!showOtpField && (!email || !password)) || 
                (showOtpField && !otp)}
              className="w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showOtpField ? 'Verifying...' : 'Authenticating...'}
                </>
              ) : showOtpField ? 'Verify OTP' : 'Continue'}
            </Button>

            {showOtpField && !lockout && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowOtpField(false)
                  setOtp('')
                  setError('')
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            )}
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {lockout ? (
              <span className="text-destructive">
                Account temporarily locked due to too many attempts
              </span>
            ) : (
              'For security reasons, all login attempts are logged.'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}