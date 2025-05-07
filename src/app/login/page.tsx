'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from '@/components/LoginModal'

export default function LoginPage() {
  const router = useRouter()
  const { login, error: authError, loading, isLoggedIn, isStaff } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (isClient && !loading && isLoggedIn) {
      console.log('User is logged in, redirecting to appropriate page')
      if (isStaff) {
        router.push('/staff/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [isClient, loading, isLoggedIn, isStaff, router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 128px)', 
      background: '#f0f2f5', 
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <LoginModal isOpen={true} onClose={() => router.push('/')} />
      </div>
    </div>
  )
}