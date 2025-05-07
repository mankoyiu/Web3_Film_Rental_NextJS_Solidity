'use client'

import React, { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Button, Space, Typography, theme } from "antd";
import { UserOutlined, LogoutOutlined, HomeOutlined, VideoCameraOutlined, PlusCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'
import LoginModal from '@/components/LoginModal'

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isStaff, logout: staffLogout, user } = useAuth()
  const { isConnected, account, connect, disconnect } = useWeb3()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Show staff info and logout if staff, otherwise show wallet info/login/logout
  return (
    <Layout.Header 
      className="artistic-header"
      style={{ 
        padding: '0 32px', 
        display: 'flex', 
        alignItems: 'center', 
        height: 64,
        background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
        boxShadow: '0 2px 16px rgba(108, 99, 255, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Link href="/" style={{ 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: 24, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          textShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          <PlayCircleOutlined style={{ fontSize: 28, color: 'white', marginRight: 8 }} />
          <Typography.Title level={4} style={{ margin: 0, color: '#fff', letterSpacing: 1 }}>
            Film Rental DApp
          </Typography.Title>
        </Link>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['films']}
          style={{ 
            marginLeft: 40, 
            flex: 1,
            background: 'transparent',
            borderBottom: 'none'
          }}
          items={[
            {
              key: 'films',
              icon: <HomeOutlined />,
              label: <Link href="/films" style={{ color: 'white' }}>Films</Link>,
            },
            {
              key: 'rentals',
              icon: <VideoCameraOutlined />,
              label: <Link href="/rentals" style={{ color: 'white' }}>My Rentals</Link>,
            },
            isStaff ? {
              key: 'admin',
              icon: <PlusCircleOutlined />,
              label: <Link href="/staff/dashboard" style={{ color: 'white' }}>Admin</Link>,
            } : null,
          ].filter(Boolean)}
        />
      </div>
      <Space size="large" style={{ marginRight: 24 }}>
        {mounted && (
          <span style={{ 
            color: 'white', 
            fontSize: 14,
            background: 'rgba(255,255,255,0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            {currentTime.toLocaleString()}
          </span>
        )}
        {isStaff ? (
          <Space>
            <Avatar 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.25)', 
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.8)' 
              }} 
              icon={<UserOutlined style={{ color: 'white' }} />} 
            />
            <span style={{ 
              marginLeft: 8, 
              marginRight: 8, 
              color: 'white',
              fontWeight: 500
            }}>
              {user?.name ? `${user.name}` : 'Staff'}
            </span>
            <Button 
              type="default" 
              icon={<LogoutOutlined />} 
              style={{ 
                marginLeft: 8,
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white'
              }} 
              onClick={staffLogout}
            >
              Logout
            </Button>
          </Space>
        ) : isConnected ? (
          <Space>
            <Avatar 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.25)', 
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.8)'
              }}
            >
              {account ? account.slice(2, 4).toUpperCase() : 'W'}
            </Avatar>
            <span style={{ 
              marginLeft: 8, 
              marginRight: 8,
              color: 'white',
              fontWeight: 500
            }}>
              {account ? formatAddress(account) : ''}
            </span>
            <Button 
              type="default" 
              icon={<LogoutOutlined />} 
              style={{ 
                marginLeft: 8,
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white'
              }} 
              onClick={disconnect}
            >
              Logout
            </Button>
          </Space>
        ) : (
          <Button 
            type="primary" 
            onClick={() => setShowLoginModal(true)}
            style={{
              background: 'white',
              color: token.colorPrimary,
              fontWeight: 500,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            Login
          </Button>
        )}
      </Space>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout.Header>
  )
}