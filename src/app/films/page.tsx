'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useFilms } from '@/contexts/FilmContext';
import { Alert, Spin, Card, Row, Col, Typography, Empty, Layout, theme, Table, Tag, Image, Input } from 'antd';

// Film interface for our application
interface Film {
  id: string;
  title: string;
  description: string;
  poster: string;
  price: number;
  available: boolean;
  genre: string;
  rentals?: number;
  year?: string;
  runtime?: string | number;
  language?: string;
}

// Convert API film to our application film format
const convertApiFilmToAppFilm = (apiFilm: any): Film => ({
  id: apiFilm._id || apiFilm.id || '',
  title: apiFilm.title || 'Untitled',
  description: `${apiFilm.year || ''} | ${apiFilm.runtime || ''} min | ${apiFilm.language || ''} | ${apiFilm.genre || ''} | Director: ${apiFilm.director || ''}`,
  poster: apiFilm.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
  price: apiFilm.price || 0.01, // Default price
  available: typeof apiFilm.available === 'boolean' ? apiFilm.available : true,
  genre: apiFilm.genre || '',
  rentals: apiFilm.rentals || 0,
  year: apiFilm.year || '',
  runtime: apiFilm.runtime || '',
  language: apiFilm.language || ''
});

export default function FilmsPage() {
  const { isConnected, rentFilm } = useWeb3();
  const [rentingFilmId, setRentingFilmId] = useState<string | null>(null);
  const [rentError, setRentError] = useState<string | null>(null);
  const [rentSuccess, setRentSuccess] = useState<string | null>(null);
  const router = useRouter();
  // Use FilmContext instead of direct API call
  const { films, loading, error, refreshFilms } = useFilms();
  const { token } = theme.useToken();
  // Add state for genre filters
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  // Add state for search text
  const [searchText, setSearchText] = useState('');
  // Add state for filtered films
  const [filteredFilms, setFilteredFilms] = useState<any[]>([]);

  // Debug log to see films from context and force refresh on load
  useEffect(() => {
    console.log('Films from FilmContext:', films);
    // Force refresh films when page loads
    refreshFilms();
  }, []);

  // Filter films based on search text and genre filters
  useEffect(() => {
    let result = [...films];
    
    // Apply search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(film => 
        film.title.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredFilms(result);
  }, [films, searchText]);

  // Extract all unique genres for filter options
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

  // Table columns configuration
  const columns = [
    {
      title: 'Poster',
      dataIndex: 'poster',
      key: 'poster',
      width: 100,
      render: (_: any, record: any) => (
        <Image 
          src={record.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={record.title}
          width={60}
          height={90}
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
      render: (text: string, record: any) => (
        <div style={{ cursor: 'pointer' }} onClick={() => router.push(`/films/${record.id}`)}>
          <Typography.Text strong>{text}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: '0.85rem' }}>
              {record.year} | {record.runtime} min | {record.language}
            </Typography.Text>
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
        // Handle genre as array or string
        const genreStr = Array.isArray(record.genre) ? record.genre.join(',') : record.genre;
        return genreStr.split(',').map((g: string) => g.trim().toLowerCase()).includes((value as string).toLowerCase());
      },
      render: (genre: string) => (
        <span>
          {genre.split(',').map((g: string) => (
            <Tag key={g.trim()} color="blue" style={{ margin: '2px' }}>
              {g.trim()}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      render: (value: number) => (
        <Typography.Text>
          {value.toFixed(2)} ETH
        </Typography.Text>
      ),
    },
    {
      title: 'Rentals',
      dataIndex: 'rentals',
      key: 'rentals',
      sorter: (a: any, b: any) => (a.rentals || 0) - (b.rentals || 0),
      render: (rentals: number) => (
        <Typography.Text>
          {rentals || 0}
        </Typography.Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        // Only show for available films and wallet-connected users
        if (!isConnected) return <span style={{ color: '#888' }}>Connect wallet</span>;
        if (!record.available) {
          return (
            <span style={{ 
              color: '#ff4d4f', 
              fontWeight: 500,
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(255, 77, 79, 0.1)',
              borderRadius: 4
            }}>
              Unavailable
            </span>
          );
        }
        return (
          <>
            <button
              disabled={rentingFilmId === record.id}
              style={{
                background: '#1677ff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: rentingFilmId === record.id ? 'not-allowed' : 'pointer',
                opacity: rentingFilmId === record.id ? 0.7 : 1
              }}
              onClick={async (e) => {
                e.stopPropagation();
                setRentingFilmId(record.id);
                setRentError(null);
                setRentSuccess(null);
                try {
                  router.push(`/films/${record.id}`); // Go to film detail page for rent
                } catch (err: any) {
                  setRentError(err?.message || 'Failed to rent film.');
                } finally {
                  setRentingFilmId(null);
                }
              }}
            >
              {rentingFilmId === record.id ? 'Renting...' : `Rent (${record.price.toFixed(2)} ETH)`}
            </button>
          </>
        );
      },
    },
  ];

  return (
    <Layout style={{ minHeight: 'calc(100vh - 134px)', padding: '24px' }}>
      <Layout.Content>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card 
            bordered={false} 
            style={{ 
              marginBottom: 32, 
              textAlign: 'center', 
              background: token.colorBgElevated,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography.Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
              Available Films
            </Typography.Title>
          </Card>
          
          {/* Add search box */}
          <div style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="Search films by name..."
              allowClear
              enterButton
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                width: '100%', 
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 8 }} />
          )}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Spin size="large" />
            </div>
          )}
          
          {!isConnected && (
            <Alert 
              message="Please connect your wallet to rent films" 
              type="warning" 
              showIcon 
              style={{ marginBottom: 24, borderRadius: 8 }} 
            />
          )}
          
          {!loading && !error && (
            <Table
              dataSource={filteredFilms}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                style: { marginTop: 16 }
              }}
              style={{ 
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
              onRow={(record) => ({
                onClick: () => router.push(`/films/${record.id}`),
                style: { cursor: 'pointer' }
              })}
              onChange={(pagination, filters, sorter) => {
                setGenreFilters((filters.genre as string[]) || []);
              }}
            />
          )}
        </div>
      </Layout.Content>
    </Layout>
  );
}