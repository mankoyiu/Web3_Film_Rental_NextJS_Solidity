'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
// WalletContext is deprecated. Only use Web3Context for wallet connection.
import { Modal, Tabs, Form, Input, Button, Alert } from 'antd';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletLogin?: () => void;
}

export default function LoginModal({ isOpen, onClose, onWalletLogin }: LoginModalProps) {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'wallet' | 'staff'>('wallet');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { connect, disconnect, isConnected, account } = useWeb3();

  const handleTabChange = (key: string) => {
    setLoginType(key as 'wallet' | 'staff');
    setError(null);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (loginType === 'wallet') {
        await connect();
        setLoading(false);
        // After wallet login, redirect to original page if stored
        const redirectPath = sessionStorage.getItem('postLoginRedirect');
        sessionStorage.removeItem('postLoginRedirect');
        if (redirectPath) {
          router.replace(redirectPath);
        } else if (onWalletLogin) {
          onWalletLogin();
        } else if (window.location.pathname === '/login') {
          router.replace('/');
        } else {
          onClose();
          window.location.reload();
        }
        return;
      } else {
        await login({ username, password });
        onClose();
        // Let the login page handle the redirect instead
        // This prevents navigation issues
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Login"
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
    >
      <Tabs defaultActiveKey={loginType} onChange={handleTabChange}>
        <Tabs.TabPane tab="Customer (Wallet)" key="wallet">
          <div>
            {isConnected ? (
              <Alert
                message={`Wallet connected: ${account?.slice(0, 8)}...${account?.slice(-4)}`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                message="Connect your wallet to access the film rental platform."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            {error && (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}
            <Form layout="vertical" onFinish={handleLogin}>
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Button onClick={onClose} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={isConnected}
                >
                  {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Staff" key="staff">
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item label="Username" required>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item label="Password" required>
              <Input.Password
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Item>
            {error && (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button onClick={onClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
       </Tabs>
    </Modal>
  );
}
