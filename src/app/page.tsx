'use client'

import Link from 'next/link';
import { Button, Layout, Typography, Row, Col, Card, Space } from 'antd';
import { PlayCircleOutlined, LockOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Page() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Layout style={{ minHeight: 'calc(100vh - 134px)', background: 'linear-gradient(120deg, #e0e7ff 0%, #f0f2f5 100%)' }}>
      <Content style={{ padding: '0', width: '100%' }}>
        {/* Hero Section */}
        <div style={{ background: 'linear-gradient(120deg, #6366f1 0%, #60a5fa 100%)', padding: '64px 0 48px 0', textAlign: 'center' }}>
          <Title style={{ color: '#fff', fontSize: 48, fontWeight: 800, marginBottom: 16 }}>Film Rental DApp</Title>
          <Paragraph style={{ color: '#e0e7ff', fontSize: 20, maxWidth: 600, margin: '0 auto 24px auto' }}>
            Experience the next generation of film rental. Browse, rent, and enjoy movies securely with blockchain technology.
          </Paragraph>
          <Space size="large">
            <Link href="/films">
              <Button type="primary" size="large" icon={<PlayCircleOutlined />}>
                Browse Films
              </Button>
            </Link>
            <Link href="/rentals">
              <Button size="large" icon={<VideoCameraOutlined />}>
                My Rentals
              </Button>
            </Link>
          </Space>
        </div>
        {/* Features Section */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px 40px 16px' }}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ minHeight: 220, boxShadow: '0 2px 12px #dbeafe80' }}>
                <LockOutlined style={{ fontSize: 36, color: '#6366f1', marginBottom: 16 }} />
                <Title level={4}>Secure & Transparent</Title>
                <Paragraph>All rentals are powered by blockchain smart contracts for maximum security and transparency.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ minHeight: 220, boxShadow: '0 2px 12px #dbeafe80' }}>
                <PlayCircleOutlined style={{ fontSize: 36, color: '#60a5fa', marginBottom: 16 }} />
                <Title level={4}>Instant Access</Title>
                <Paragraph>Rent and watch your favorite films instantly with seamless crypto payments and digital delivery.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ minHeight: 220, boxShadow: '0 2px 12px #dbeafe80' }}>
                <UserOutlined style={{ fontSize: 36, color: '#818cf8', marginBottom: 16 }} />
                <Title level={4}>Your Personal Film Library</Title>
                <Paragraph>Easily manage your rentals and discover new favorites, all in one place.</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
        {/* About Section */}
        <div style={{ background: '#fff', padding: '40px 0' }}>
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fff', boxShadow: '0 2px 12px #e0e7ff50' }}>
                <Title level={3} style={{ marginBottom: 16 }}>Why Choose Film Rental DApp?</Title>
                <Paragraph style={{ fontSize: 16, color: '#555' }}>
                  Film Rental DApp is a decentralized platform that brings you a secure, fast, and user-friendly way to rent and enjoy movies. Our mission is to make film rentals accessible to everyone, everywhere, while ensuring your privacy and security with blockchain technology.
                </Paragraph>
                <Paragraph style={{ color: '#888' }}>
                  {isLoggedIn ? (
                    <span>Welcome back, <Text strong>{user?.username || 'user'}</Text>! Ready to discover your next favorite film?</span>
                  ) : (
                    <span>Sign in or browse our catalog to get started.</span>
                  )}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
