'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFilms } from '@/contexts/FilmContext'
import { Tabs, Card, Table, Statistic, Alert, Spin, Tag, Button, Modal, message, Layout, theme, Typography, Space, Progress, Image } from 'antd';
import axios from 'axios';

interface RentalStats {
  totalRentals: number
  activeRentals: number
  revenue: number
  popularGenres: { genre: string; count: number }[]
  totalGenreCounts: number
}

export default function StaffDashboardPage() {
  const router = useRouter()
  const { user, isStaff, loading: authLoading } = useAuth()
  const { films, loading: filmsLoading, error: filmsError, deleteFilm, refreshFilms } = useFilms()
  const [activeTab, setActiveTab] = useState<'overview' | 'films'>('overview')
  const [stats, setStats] = useState<RentalStats>({
    totalRentals: 0,
    activeRentals: 0,
    revenue: 0,
    popularGenres: [],
    totalGenreCounts: 0
  })
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [filmToDelete, setFilmToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { token } = theme.useToken();

  // --- Additions for sorting and filtering ---
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Function to load active rentals from all users
  const loadAllRentals = async () => {
    try {
      // Fetch all rental files from the server
      const response = await axios.get('/api/rentals/all');
      if (response.data && response.data.rentals) {
        return response.data.rentals;
      }
      return [];
    } catch (error) {
      console.error('Error loading all rentals:', error);
      return [];
    }
  };

  // Calculate active rentals
  const calculateActiveRentals = (rentals: any[]) => {
    const now = new Date();
    return rentals.filter(rental => {
      return rental.status === 'active' && new Date(rental.expiresAt) > now;
    }).length;
  };

  useEffect(() => {
    // Calculate stats based on films
    const calculateStats = async () => {
      if (films.length > 0) {
        const totalRentals = films.reduce((sum, film) => sum + (film.rentals || 0), 0);
        const totalRevenue = films.reduce((sum, film) => sum + (film.revenue || 0), 0);
        const genreCounts: Record<string, number> = {};
        let totalGenreCounts = 0;

        films.forEach(film => {
          if (film.genre) {
            film.genre.split(',').forEach(g => {
              const genre = g.trim();
              if (genre) {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                totalGenreCounts++;
              }
            });
          }
        });

        const popularGenres = Object.entries(genreCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5) // Top 5
          .map(([genre, count]) => ({ genre, count }));

        // Load all rentals to calculate active rentals
        const allRentals = await loadAllRentals();
        const activeRentals = calculateActiveRentals(allRentals);

        setStats({
          totalRentals,
          activeRentals,
          revenue: totalRevenue,
          popularGenres,
          totalGenreCounts
        });
      }
    };

    calculateStats();
  }, [films])

  // Only split multi-genre strings into individual genres for the filter
  const genreSet = new Set<string>();
  films.forEach(film => {
    if (film.genre) {
      film.genre.split(',').forEach(g => {
        const trimmed = g.trim();
        if (trimmed) genreSet.add(trimmed);
      });
    }
  });
  const allGenres = Array.from(genreSet);

  // --- CLIENT-SIDE GUARD FOR AUTH ---
  useEffect(() => { 
    setIsClient(true);
    // Force refresh films when dashboard loads
    refreshFilms();
  }, []);

  // Handle authentication and redirects
  useEffect(() => {
    if (isClient && !authLoading && user && !(user.role === 'admin' || user.role === 'staff')) {
      // Not authorized, show error and redirect
      message.error('You are not authorized to access the staff dashboard.');
      router.push('/login');
    }
    if (isClient && !authLoading && !user) {
      // Not logged in, redirect
      router.push('/login');
    }
  }, [isClient, authLoading, user, router]);

  // Show loading spinner while auth state is being determined or films are loading
  if (!isClient || authLoading || filmsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin size="large" tip={authLoading ? "Checking authentication..." : "Loading films data..."} />
      </div>
    );
  }

  // Show error if not authorized
  if (user && !(user.role === 'admin' || user.role === 'staff')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Alert message="You are not authorized to access this page." type="error" showIcon />
      </div>
    );
  }

  // Don't render if not logged in (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  // Table sorters and filters
  const columns = [
    {
      title: 'Poster',
      dataIndex: 'poster',
      key: 'poster',
      width: 80,
      render: (_: any, record: any) => (
        <Image 
          src={record.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={record.title}
          width={50}
          height={75}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={{ src: record.poster }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: any, b: any) => a.title.localeCompare(b.title),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: token.colorText }}>{text}</div>
          <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>
            {record.year} • {record.director}
          </div>
        </div>
      ),
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      filters: allGenres.map(g => ({ text: g, value: g })),
      filteredValue: genreFilters.length ? genreFilters : null,
      onFilter: (value: boolean | React.Key, record: any) => {
        if (!record.genre) return false;
        // Defensive: handle genre as array or string
        const genreStr = Array.isArray(record.genre) ? record.genre.join(',') : record.genre;
        return genreStr.split(',').map((g: string) => g.trim().toLowerCase()).includes((value as string).toLowerCase());
      },
      render: (genre: string) => (
        <Tag color="green" style={{ borderRadius: 4 }}>{genre}</Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      render: (value: number) => (
        <Typography.Text style={{ color: token.colorPrimary, fontWeight: 500 }}>
          {value.toFixed(2)} ETH
        </Typography.Text>
      )
    },
    {
      title: 'Rentals',
      dataIndex: 'rentals',
      key: 'rentals',
      sorter: (a: any, b: any) => (a.rentals || 0) - (b.rentals || 0),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      render: (rentals: number) => (
        <Typography.Text style={{ color: token.colorText }}>
          {rentals || 0}
        </Typography.Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => 
        available ? 
          <Tag color="success" style={{ borderRadius: 4 }}>Available</Tag> : 
          <Tag color="error" style={{ borderRadius: 4 }}>Unavailable</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Link href={`/staff/films/${record.id}/edit`}>
            <Button 
              type="primary" 
              ghost
              style={{ borderRadius: 6 }}
            >
              Edit
            </Button>
          </Link>
          <Button 
            type="primary" 
            danger 
            ghost
            onClick={() => showDeleteConfirm(record.id)}
            style={{ borderRadius: 6 }}
          >
            Delete
          </Button>
        </Space>
      ),
      align: 'right' as const,
    },
  ];

  // --- END Additions ---

  // Handle film deletion
  const showDeleteConfirm = (filmId: string) => {
    setFilmToDelete(filmId);
    setDeleteModalVisible(true);
  };

  const handleDeleteFilm = async () => {
    if (!filmToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteFilm(filmToDelete);
      if (success) {
        message.success('Film deleted successfully!');
        
        // Close the modal
        setDeleteModalVisible(false);
        setFilmToDelete(null);
        
        // Force an immediate re-render by updating the UI
        // No need to call refreshFilms - the deletion is already done in context
        // Just trigger a state update to force re-render
        setStats({...stats}); // This forces a re-render
      }
    } catch (err: any) {
      console.error('Failed to delete film:', err);
      message.error('Failed to delete film: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setFilmToDelete(null);
  };

  // handleSaveToFile function removed

  return (
    <Layout style={{ minHeight: 'calc(100vh - 134px)', background: token.colorBgContainer }}>
      <Layout.Content style={{ padding: '32px 16px', minHeight: 500 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 20 }}>
            <Link href="/staff/change-password" passHref legacyBehavior>
              <Button type="primary" style={{ borderRadius: 6 }}>
                Change Password
              </Button>
            </Link>
          </Space>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24
          }}>
            <div>
              <Typography.Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
                Staff Dashboard
              </Typography.Title>
              {user && (
                <Typography.Text style={{ color: token.colorTextSecondary }}>
                  Welcome, {user.name || user.username}
                </Typography.Text>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Save Films to File button removed */}
              <Link href="/staff/films/new">
                <Button 
                  type="primary" 
                  size="large"
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
                  }}
                >
                  Add New Film
                </Button>
              </Link>
            </div>
          </div>
          
          {filmsError && (
            <Alert 
              message={filmsError} 
              type="error" 
              showIcon 
              style={{ 
                marginBottom: 24,
                borderRadius: 8
              }} 
            />
          )}
          
          {filmsLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: 64,
              background: token.colorBgElevated,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <Spin size="large" />
            </div>
          ) : (
            <Tabs
              activeKey={activeTab}
              onChange={key => setActiveTab(key as 'overview' | 'films')}
              style={{ 
                marginBottom: 32,
                background: token.colorBgElevated,
                padding: '16px 16px 0',
                borderRadius: '12px 12px 0 0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
              items={[
                {
                  key: 'overview',
                  label: 'Overview',
                  children: (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        gap: 24, 
                        marginBottom: 24,
                        flexWrap: 'wrap'
                      }}>
                        <Card 
                          bordered={false} 
                          style={{ 
                            flex: 1, 
                            minWidth: 220,
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          <Statistic 
                            title={<span style={{ color: token.colorTextSecondary }}>Total Rentals</span>} 
                            value={stats.totalRentals}
                            valueStyle={{ color: token.colorTextHeading }}
                          />
                        </Card>
                        <Card 
                          bordered={false} 
                          style={{ 
                            flex: 1, 
                            minWidth: 220,
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          <Statistic 
                            title={<span style={{ color: token.colorTextSecondary }}>Active Rentals</span>} 
                            value={stats.activeRentals}
                            valueStyle={{ color: token.colorTextHeading }}
                          />
                        </Card>
                        <Card 
                          bordered={false} 
                          style={{ 
                            flex: 1, 
                            minWidth: 220,
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          <Statistic 
                            title={<span style={{ color: token.colorTextSecondary }}>Revenue</span>} 
                            value={stats.revenue} 
                            suffix="ETH" 
                            precision={2}
                          />
                        </Card>
                      </div>
                      
                      <Card 
                        title={
                          <Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                            Popular Genres
                          </Typography.Title>
                        } 
                        bordered={false} 
                        style={{ 
                          marginBottom: 24,
                          borderRadius: 12,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        {stats.popularGenres.map((genre) => (
                          <div key={genre.genre} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: 16
                          }}>
                            <div style={{ 
                              width: 120, 
                              fontWeight: 500,
                              color: token.colorText
                            }}>
                              {genre.genre}
                            </div>
                            <div style={{ flex: 1, margin: '0 12px' }}>
                              <Progress 
                                percent={Math.round((genre.count / stats.totalGenreCounts) * 100)} 
                                showInfo={false}
                                strokeColor={token.colorPrimary}
                                trailColor={token.colorBgContainer}
                                style={{ margin: 0 }}
                              />
                            </div>
                            <div style={{ 
                              width: 40, 
                              textAlign: 'right',
                              color: token.colorTextSecondary
                            }}>
                              {genre.count}
                            </div>
                          </div>
                        ))}
                      </Card>
                    </>
                  )
                },
                {
                  key: 'films',
                  label: 'Films',
                  children: (
                    <Table
                      dataSource={films}
                      rowKey="id"
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        style: { marginTop: 16 }
                      }}
                      style={{ 
                        borderRadius: 8,
                        overflow: 'hidden'
                      }}
                      columns={columns}
                      onChange={(pagination, filters, sorter) => {
                        setGenreFilters((filters.genre as string[]) || []);
                      }}
                    />
                  )
                }
              ]}
            />
          )}
        </div>
      </Layout.Content>

      <Modal
        title="Delete Film"
        open={deleteModalVisible}
        onOk={handleDeleteFilm}
        onCancel={handleCancelDelete}
        confirmLoading={isDeleting}
        okButtonProps={{ 
          danger: true,
          style: { borderRadius: 6 }
        }}
        cancelButtonProps={{ 
          style: { borderRadius: 6 }
        }}
        style={{ 
          borderRadius: 12,
          overflow: 'hidden'
        }}
      >
        <p style={{ color: token.colorText }}>Are you sure you want to delete this film?</p>
      </Modal>
    </Layout>
  )
}
