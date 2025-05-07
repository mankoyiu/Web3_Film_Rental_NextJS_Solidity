'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Typography, Button, Spin, Alert, Layout, theme, Divider, Tag, Rate } from 'antd';
import { useFilms } from '@/contexts/FilmContext';
import { useWeb3 } from '@/contexts/Web3Context';

interface Film {
  id: string
  title: string
  year: number
  director: string
  genre: string
  runtime: number
  poster: string
  description: string
  price: number
  available: boolean
  language?: string
}

import React from 'react';
export default function FilmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const filmId = String(unwrappedParams.id ?? '');
  const router = useRouter()
  const { films, loading, error } = useFilms();
  const [isRenting, setIsRenting] = useState(false);
  const { token } = theme.useToken();
  const { rentFilm, isConnected, account: address } = useWeb3();

  const film = films.find(f => String(f.id) === filmId);

  const [localError, setLocalError] = useState('');
  const [isAlreadyRented, setIsAlreadyRented] = useState(false);
  
  // Check if the film is already rented by the user
  useEffect(() => {
    const checkIfAlreadyRented = () => {
      if (!film || !address || typeof window === 'undefined') return;
      
      try {
        // Get user rentals from localStorage
        const storedRentalsKey = `rentals_${address.toLowerCase()}`;
        const storedRentals = localStorage.getItem(storedRentalsKey);
        
        if (storedRentals) {
          const userRentals = JSON.parse(storedRentals);
          
          // Check if this film is in the user's current rentals
          const now = new Date();
          const isRented = userRentals.some((rental: any) => {
            return rental.filmId === film.id && new Date(rental.expiresAt) > now;
          });
          
          setIsAlreadyRented(isRented);
          console.log(`Film ${film.id} already rented: ${isRented}`);
        }
      } catch (err) {
        console.error('Error checking if film is already rented:', err);
      }
    };
    
    checkIfAlreadyRented();
  }, [film, address]);

  const handleRent = async () => {
    if (!film) return;
    setIsRenting(true);
    setLocalError('');
    try {
      console.log('Renting film with details:', { 
        id: film.id, 
        price: film.price.toString(),
        title: film.title,
        poster: film.poster
      });
      
      // Pass film title and poster to rentFilm function
      await rentFilm(
        film.id, 
        film.price.toString(),
        film.title,
        film.poster
      );
      
      // Redirect to rentals page with refresh parameter after successful transaction
      router.push('/rentals?refresh=true');
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to rent film. Please try again.');
    } finally {
      setIsRenting(false);
    }
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 134px)', background: token.colorBgContainer }}>
      <Layout.Content style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Button 
            type="default" 
            onClick={() => router.push('/films')} 
            style={{ 
              marginBottom: 24,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
            }}
          >
            ← Back to Films
          </Button>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              style={{ 
                margin: '40px 0',
                borderRadius: 8 
              }} 
            />
          ) : film && (
            <Card 
              bordered={false} 
              style={{ 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                borderRadius: 12,
                background: token.colorBgElevated,
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                display: 'flex', 
                gap: 40, 
                flexWrap: 'wrap',
                position: 'relative'
              }}>
                <div style={{ 
                  flex: '0 0 300px',
                  position: 'relative'
                }}>
                  <img
                    src={film.poster}
                    alt={film.title}
                    style={{ 
                      width: '100%', 
                      borderRadius: 12, 
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                      objectFit: 'cover',
                      aspectRatio: '2/3'
                    }}
                  />
                </div>
                
                <div style={{ flex: 1, minWidth: 280 }}>
                  <Typography.Title 
                    level={2} 
                    style={{ 
                      margin: 0, 
                      marginBottom: 8,
                      color: token.colorTextHeading
                    }}
                  >
                    {film.title}
                  </Typography.Title>
                  <Typography.Text style={{ fontSize: 18, color: token.colorTextSecondary, marginBottom: 16, display: 'block' }}>
                    Price: <b>{film.price?.toFixed(2)} ETH</b>
                  </Typography.Text>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 12, 
                    marginBottom: 16,
                    color: token.colorTextSecondary
                  }}>
                    <Tag color="blue">{film.year}</Tag>
                    {film.runtime && <Tag color="purple">{film.runtime} min</Tag>}
                    {film.genre && <Tag color="green">{film.genre}</Tag>}
                    {film.language && <Tag color="orange">{film.language}</Tag>}
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Typography.Text strong style={{ color: token.colorTextHeading }}>Director:</Typography.Text>{' '}
                    <Typography.Text style={{ color: token.colorText }}>{film.director}</Typography.Text>
                  </div>
                  
                  {film.description && (
                    <div style={{ marginBottom: 24 }}>
                      <Typography.Paragraph 
                        style={{ 
                          color: token.colorText,
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}
                      >
                        {film.description}
                      </Typography.Paragraph>
                    </div>
                  )}
                  
                  <Divider style={{ margin: '24px 0' }} />
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 24, 
                    marginBottom: 16,
                    flexWrap: 'wrap'
                  }}>
                    <Typography.Title 
                      level={3} 
                      style={{ 
                        margin: 0,
                        color: film.available ? token.colorPrimary : token.colorTextDisabled
                      }}
                    >
                      {film.price} ETH
                    </Typography.Title>
                    
                    {film.available ? (
                      <Button
                        type="primary"
                        size="large"
                        loading={isRenting}
                        disabled={isRenting || !isConnected || isAlreadyRented}
                        onClick={handleRent}
                        style={{ marginTop: 24, borderRadius: 8, fontWeight: 600 }}
                      >
                        {!isConnected ? 'Connect Wallet' : 
                         isRenting ? 'Processing...' : 
                         isAlreadyRented ? 'Already Rented' : 'Rent Now'}
                      </Button>
                    ) : (
                      <Button
                        type="default"
                        size="large"
                        disabled={true}
                        style={{ 
                          marginTop: 24, 
                          borderRadius: 8, 
                          fontWeight: 600,
                          background: 'rgba(255, 77, 79, 0.1)',
                          borderColor: '#ff4d4f',
                          color: '#ff4d4f'
                        }}
                      >
                        Unavailable
                      </Button>
                    )}
                  </div>
                  
                  {!film.available && (
                    <Alert 
                      message="This film is currently unavailable for rent." 
                      description="The administrator has marked this film as unavailable. Please check back later or browse other available films."
                      type="error" 
                      showIcon 
                      style={{ borderRadius: 8 }}
                    />
                  )}
                  
                  {isAlreadyRented && (
                    <Alert 
                      message="You've already rented this film" 
                      description="This film is in your current rentals. You can watch it from your rentals page until your rental period expires." 
                      type="info" 
                      showIcon 
                      style={{ borderRadius: 8, marginTop: 16 }}
                      action={
                        <Button size="small" type="primary" onClick={() => router.push('/rentals')}>
                          Go to My Rentals
                        </Button>
                      }
                    />
                  )}
                  
                  {error && (
                    <Alert 
                      message={error} 
                      type="error" 
                      showIcon 
                      style={{ 
                        marginTop: 16,
                        borderRadius: 8
                      }} 
                    />
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Layout.Content>
    </Layout>
  )
}