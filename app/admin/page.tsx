'use client'

import { useState } from 'react'
import AdminOrdersDashboard from './AdminOrdersDashboard'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock admin credentials (in a real app, these should be verified server-side)
const ADMIN_CREDENTIALS = [
  { email: 'inreluxe@gmail.com', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'anujayasekara730' },
  // Add more admin emails/passwords as needed
]

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const isValidAdmin = ADMIN_CREDENTIALS.some(
        cred => cred.email === email && cred.password === password
      )

      if (isValidAdmin) {
        setAuthenticated(true)
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred during authentication')
      console.error(err)
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
          <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Restricted access. Authorized personnel only.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              />
            </div>
            
            <Button 
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            For security reasons, all login attempts are logged.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}