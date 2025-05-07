'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tabs, Card, Button, Empty, Row, Col, Typography } from 'antd';
import { useWeb3 } from '@/contexts/Web3Context'
import { useState as useReactState } from 'react'
import LoginModal from '@/components/LoginModal'

interface Rental {
  id: string
  filmId: string
  title: string
  poster: string
  rentedAt: string
  expiresAt: string
  status: 'active' | 'expired'
}

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current')
  const [showLoginModal, setShowLoginModal] = useReactState(false)
  const [wasConnected, setWasConnected] = useState(false)
  const { isConnected, connect, getUserRentals, account: address } = useWeb3()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet was previously connected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedConnected = localStorage.getItem('wallet_connected') === 'true';
      setWasConnected(storedConnected);
    }
  }, []);

  const handleWalletLogin = () => {
    // Use the stored redirect path or fallback to current path
    const redirectPath = sessionStorage.getItem('postLoginRedirect') || window.location.pathname;
    window.location.href = redirectPath;
  }

  // Force refresh when component mounts or when URL has a refresh parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we have a 'refresh' parameter in the URL (could be added after rental)
      const urlParams = new URLSearchParams(window.location.search);
      const hasRefreshParam = urlParams.has('refresh');
      
      if (hasRefreshParam) {
        // Remove the parameter without page reload
        urlParams.delete('refresh');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Add a refresh counter to force re-fetching
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Force a refresh function that can be called after transactions
  const forceRefresh = () => {
    console.log('Forcing refresh of rentals...');
    setRefreshCounter(prev => prev + 1);
  };
  
  // Direct localStorage check - this will work even if Web3 connection fails
  useEffect(() => {
    const loadRentalsFromLocalStorage = () => {
      if (typeof window === 'undefined') return;
      
      try {
        // First try to get rentals for the current connected address
        let rentalKey = '';
        
        if (address) {
          rentalKey = `rentals_${address.toLowerCase()}`;
        } else {
          // If no address, try to find any rentals_ key in localStorage
          const allKeys = Object.keys(localStorage);
          const rentalKeys = allKeys.filter(key => key.startsWith('rentals_'));
          if (rentalKeys.length > 0) {
            rentalKey = rentalKeys[0]; // Use the first one found
          }
        }
        
        if (rentalKey) {
          const storedRentals = localStorage.getItem(rentalKey);
          if (storedRentals) {
            const parsedRentals = JSON.parse(storedRentals);
            console.log('Loaded rentals directly from localStorage:', parsedRentals);
            setRentals(parsedRentals);
          }
        }
      } catch (err) {
        console.error('Error loading rentals from localStorage:', err);
      }
    };
    
    // Load rentals immediately from localStorage
    loadRentalsFromLocalStorage();
    
    // Then try to fetch from Web3 if connected
    if (isConnected) {
      const fetchRentals = async () => {
        setLoading(true);
        try {
          console.log('Fetching rentals via Web3, refresh count:', refreshCounter);
          const userRentals = await getUserRentals();
          console.log('Raw blockchain rentals:', userRentals);
          
          if (userRentals && userRentals.length > 0) {
            setRentals(userRentals);
          }
        } catch (err) {
          let message = 'Failed to fetch rentals';
          if (err && typeof err === 'object' && err !== null && 'message' in err) {
            message = (err as { message?: string }).message || message;
          }
          setError(message);
        } finally {
          setLoading(false);
        }
      };
      fetchRentals();
    }
  }, [isConnected, getUserRentals, refreshCounter]);

  // Process rentals for current and past sections
  const currentRentals = rentals.filter(rental => {
    const expiresAt = new Date(rental.expiresAt);
    const now = new Date();
    return expiresAt > now; // If expiry date is in the future, it's a current rental
  });
  
  const pastRentals = rentals.filter(rental => {
    const expiresAt = new Date(rental.expiresAt);
    const now = new Date();
    return expiresAt <= now; // If expiry date is in the past, it's a past rental
  });
  
  // Debug logging
  console.log('All rentals:', rentals);
  console.log('Current rentals:', currentRentals);
  console.log('Past rentals:', pastRentals);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isConnected) {
    return (
      <main style={{ minHeight: 'calc(100vh - 134px)', background: '#f0f2f5', padding: '40px 0' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', textAlign: 'center' }}>
          <Empty
            description={
              <span>
                {wasConnected 
                  ? 'Your wallet was disconnected. Please reconnect to view your rentals.'
                  : 'Please connect your wallet to view your rentals.'}
              </span>
            }
          >
            <Button type="primary" onClick={() => {
              sessionStorage.setItem('postLoginRedirect', window.location.pathname);
              if (wasConnected) {
                connect().catch(() => {
                  setShowLoginModal(true);
                });
              } else {
                setShowLoginModal(true);
              }
            }}>
              {wasConnected ? 'Reconnect Wallet' : 'Connect Wallet'}
            </Button>
          </Empty>
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onWalletLogin={handleWalletLogin} />
        </div>
      </main>
    )
  }

  // Keep the refresh counter for functionality, but remove debug functions

  return (
    <main style={{ minHeight: 'calc(100vh - 134px)', background: '#f0f2f5', padding: '40px 0' }}>
      <button
        onClick={() => window.location.href = '/'}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 32,
          padding: '12px 28px',
          borderRadius: 32,
          border: 'none',
          background: 'linear-gradient(90deg, #6e8efb 0%, #a777e3 100%)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          boxShadow: '0 4px 24px #a777e355',
          cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #a777e3 0%, #6e8efb 100%)')}
        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #6e8efb 0%, #a777e3 100%)')}
      >
        <span style={{fontSize: 22, marginRight: 8, display: 'flex', alignItems: 'center'}}>←</span>
        Back to Home
      </button>
      {/* No debug panel */}
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card bordered={false} style={{ marginBottom: 32, textAlign: 'center', background: '#fff' }}>
          <Typography.Title level={2} style={{ margin: 0 }}>My Rentals</Typography.Title>
        </Card>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as 'current' | 'past')}
          style={{ marginBottom: 32 }}
          items={[{
            key: 'current',
            label: `Current Rentals (${currentRentals.length})`,
            children: (
              currentRentals.length > 0 ? (
                <Row gutter={[24, 32]}>
                  {currentRentals.map(rental => (
                    <Col xs={24} sm={12} md={8} lg={8} key={rental.id}>
                      <Card
                        cover={<img alt={rental.title} src={rental.poster} style={{ height: 256, objectFit: 'cover' }} />}
                        title={rental.title}
                        actions={[
                          <Link href={`/films/${rental.filmId}`} key="details">
                            <Button type="link">View Details</Button>
                          </Link>,
                          <Link href={`/films/${rental.filmId}/watch`} key="watch">
                            <Button type="primary" style={{ marginLeft: 8 }}>Watch</Button>
                          </Link>
                        ]}
                        style={{ marginBottom: 24 }}
                      >
                        <div>Rented: {formatDate(rental.rentedAt)}</div>
                        <div>Expires: {formatDate(rental.expiresAt)}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="You have no current rentals.">
                  <Link href="/films">
                    <Button type="primary">Browse Films</Button>
                  </Link>
                </Empty>
              )
            )
          }, {
            key: 'past',
            label: `Past Rentals (${pastRentals.length})`,
            children: (
              pastRentals.length > 0 ? (
                <Row gutter={[24, 32]}>
                  {pastRentals.map(rental => (
                    <Col xs={24} sm={12} md={8} lg={8} key={rental.id}>
                      <Card
                        cover={<img alt={rental.title} src={rental.poster} style={{ height: 256, objectFit: 'cover' }} />}
                        title={rental.title}
                        actions={[
                          <Link href={`/films/${rental.filmId}`} key="details">
                            <Button type="link">View Details</Button>
                          </Link>
                        ]}
                        style={{ marginBottom: 24 }}
                      >
                        <div>Rented: {formatDate(rental.rentedAt)}</div>
                        <div>Expires: {formatDate(rental.expiresAt)}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="You have no past rentals.">
                  <Link href="/films">
                    <Button type="primary">Browse Films</Button>
                  </Link>
                </Empty>
              )
            )
          }]} />
      </div>

    </main>
  )
}