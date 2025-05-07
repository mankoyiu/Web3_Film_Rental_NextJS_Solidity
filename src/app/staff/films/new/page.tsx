'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios';
import { useFilms } from '@/contexts/FilmContext';

import { Card, Form, Input, InputNumber, Select, Button, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilmFormData {
  title: string
  year: string
  director: string
  genre: string
  runtime: string
  price: string
  description: string
  poster: string
}

export default function NewFilmPage() {
  const [form] = Form.useForm();
  const router = useRouter()
  const { isStaff, loading } = useAuth()
  const { films, createFilm, refreshFilms } = useFilms();

  useEffect(() => {
    // Redirect if not staff
    if (!loading && !isStaff) {
      router.push('/login')
    }
  }, [loading, isStaff, router])

  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    year: '',
    director: '',
    genre: '',
    runtime: '',
    price: '',
    description: '',
    poster: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Search film info from external API
  const handleFilmSearch = async () => {
    setSearching(true);
    setSearchError('');
    try {
      const filmName = form.getFieldValue('title');
      if (!filmName) {
        setSearchError('Please enter a film name to search.');
        setSearching(false);
        return;
      }
      const searchLower = filmName.trim().toLowerCase();
      let films = [];
      
      // Helper function to filter films
      const filterFilms = (filmList: any[]) => {
        // First try exact match
        const exactMatches = filmList.filter(f => 
          f.title && f.title.trim().toLowerCase() === searchLower
        );
        if (exactMatches.length > 0) return exactMatches;

        // Then try phrase match for multi-word searches
        const searchWords = searchLower.split(/\s+/);
        if (searchWords.length > 1) {
          const phraseMatches = filmList.filter(f => 
            f.title && f.title.toLowerCase().includes(searchLower)
          );
          if (phraseMatches.length > 0) return phraseMatches;
        }

        // Finally try word-by-word match
        return filmList.filter(f => {
          if (!f.title) return false;
          const titleWords = f.title.toLowerCase().split(/\s+/);
          return searchWords.every((searchWord: string) => 
            titleWords.some((titleWord: string) => titleWord === searchWord)
          );
        });
      };

      try {
        // Try API search first with the search parameter
        const res = await axios.get(
          `https://pcpdfilm.starsknights.com:18888/api/v2/films?search=${encodeURIComponent(filmName)}`
        );
        
        // Accept both possible shapes
        const apiResults = Array.isArray(res.data) ? res.data : 
                         Array.isArray(res.data?.data) ? res.data.data : [];
        
        // Only use API results if they match our search criteria
        const filteredResults = filterFilms(apiResults);
        if (filteredResults.length > 0) {
          films = filteredResults;
        } else {
          // If no matches in search results, try fetching all films
          const resAll = await axios.get('https://pcpdfilm.starsknights.com:18888/api/v2/films');
          const allFilms = Array.isArray(resAll.data) ? resAll.data : 
                          Array.isArray(resAll.data?.data) ? resAll.data.data : [];
          
          films = filterFilms(allFilms);
        }

        if (films.length === 0) {
          setSearchError('No film found. Please check the name or try another one.');
          setSearching(false);
          return;
        }
      } catch (err) {
        console.error('Film search error:', err);
        setSearchError('Failed to fetch film info.');
        setSearching(false);
        return;
      }

      // Clear any previous error
      setSearchError('');
      // Use the first matching result
      const film = films[0];
      
      // Update form with found film data
      form.setFieldsValue({
        title: film.title || '',
        year: film.year || '',
        director: film.director || '',
        genre: film.genre || '',
        runtime: film.runtime || '',
        price: film.price || '',
        description: film.description || '',
        poster: film.poster || ''
      });
      setFormData({
        title: film.title || '',
        year: film.year || '',
        director: film.director || '',
        genre: film.genre || '',
        runtime: film.runtime || '',
        price: film.price || '',
        description: film.description || '',
        poster: film.poster || ''
      });
      
      // Reset searching state after successful update
      setSearching(false);
    } catch (err) {
      setSearchError('Failed to fetch film info.');
      setSearching(false);
    }
  };

  const handleFinish = async (values: FilmFormData) => {
    setIsSubmitting(true);
    setError('');
    try {
      // Convert price to number for context createFilm
      const filmData = { ...values, price: parseFloat(values.price) };
      const newFilm = await createFilm(filmData);
      console.log('Film created successfully:', newFilm);
      router.push('/staff/dashboard');
    } catch (err) {
      console.error('Error creating film:', err);
      setError('Failed to create film. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <Card title={<span style={{ fontSize: 24, fontWeight: 600 }}>Add New Film</span>} bordered>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={formData}
            autoComplete="off"
          >
            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter the film title' }]}> 
              <Input
                addonAfter={<Button
                  icon={<SearchOutlined />} 
                  loading={searching}
                  onClick={handleFilmSearch}
                  style={{ padding: '0 8px' }}
                  type="default"
                >Search</Button>}
                placeholder="Enter film name and click search"
              />
            </Form.Item>
            {searchError && (
              <Form.Item>
                <Alert message={searchError} type="warning" showIcon />
              </Form.Item>
            )}
            <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please enter the release year' }]}> 
              <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Director" name="director" rules={[{ required: true, message: 'Please enter the director' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Genre" name="genre" rules={[{ required: true, message: 'Please select a genre' }]}> 
              <Select>
                <Select.Option value="Action">Action</Select.Option>
                <Select.Option value="Comedy">Comedy</Select.Option>
                <Select.Option value="Drama">Drama</Select.Option>
                <Select.Option value="Horror">Horror</Select.Option>
                <Select.Option value="Sci-Fi">Sci-Fi</Select.Option>
                <Select.Option value="Thriller">Thriller</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Runtime (minutes)" name="runtime" rules={[{ required: true, message: 'Please enter runtime' }]}> 
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Price (ETH)" name="price" rules={[{ required: true, message: 'Please enter the price' }]}> 
              <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Poster URL" name="poster" rules={[{ required: true, message: 'Please enter the poster URL' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter a description' }]}> 
              <Input.TextArea rows={4} />
            </Form.Item>
            {error && (
              <Form.Item>
                <Alert message={error} type="error" showIcon />
              </Form.Item>
            )}
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <Button type="default" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>Create Film</Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>

    </main>
  );
}