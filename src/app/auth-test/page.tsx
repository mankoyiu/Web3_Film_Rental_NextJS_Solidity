'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isAuthenticated, getCurrentUser } from '@/services/auth'
import Cookies from 'js-cookie'
import { Card, Typography, Button, Divider } from 'antd'

export default function AuthTestPage() {
  const auth = useAuth()
  const [cookies, setCookies] = useState<Record<string, string>>({})
  
  useEffect(() => {
    // Get all cookies
    const allCookies: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name) allCookies[name] = value || ''
    })
    setCookies(allCookies)
  }, [])

  // Direct auth checks
  const directIsAuth = isAuthenticated()
  const directUser = getCurrentUser()

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography.Title level={2}>Authentication Test Page</Typography.Title>
      
      <Card title="Auth Context State" style={{ marginBottom: '20px' }}>
        <pre>{JSON.stringify({
          isLoggedIn: auth.isLoggedIn,
          isStaff: auth.isStaff,
          isAdmin: auth.isAdmin,
          loading: auth.loading,
          user: auth.user
        }, null, 2)}</pre>
      </Card>
      
      <Card title="Direct Auth Checks" style={{ marginBottom: '20px' }}>
        <pre>{JSON.stringify({
          isAuthenticated: directIsAuth,
          currentUser: directUser
        }, null, 2)}</pre>
      </Card>
      
      <Card title="All Cookies" style={{ marginBottom: '20px' }}>
        <pre>{JSON.stringify(cookies, null, 2)}</pre>
      </Card>
      
      <Card title="js-cookie Values" style={{ marginBottom: '20px' }}>
        <pre>{JSON.stringify({
          token: Cookies.get('token'),
          username: Cookies.get('username'),
          userRole: Cookies.get('userRole')
        }, null, 2)}</pre>
      </Card>
      
      <Divider />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button type="primary" onClick={() => auth.login({ username: 'admin', password: 'password123' })}>
          Login as Admin
        </Button>
        <Button type="primary" onClick={() => auth.login({ username: 'staff', password: 'staffpass' })}>
          Login as Staff
        </Button>
        <Button danger onClick={() => auth.logout()}>
          Logout
        </Button>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
