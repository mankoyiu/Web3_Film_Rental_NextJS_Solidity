'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFilms } from '@/contexts/FilmContext'
import { Card, Form, Input, Button, Typography, Spin, Alert, message, Switch } from 'antd';

interface FilmFormData {
  title: string
  year: string
  director: string
  genre: string
  runtime: string
  language: string
  price: string
  description: string
  poster: string
  available: boolean
}

// Create a client component that receives the ID
function EditFilmPageClient({ id }: { id: string }) {
  const router = useRouter()
  const { isStaff, loading: authLoading } = useAuth()
  const { getFilmById, updateFilm, loading: filmsLoading } = useFilms()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [film, setFilm] = useState<FilmFormData | null>(null)

  useEffect(() => {
    // Redirect if not staff
    if (!authLoading && !isStaff) {
      router.push('/login')
    }
  }, [authLoading, isStaff, router])

  // State to track form field values
  const [formValues, setFormValues] = useState<FilmFormData | null>(null);
  
  // Load film data only once when component mounts
  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const filmData = await getFilmById(id)
        if (filmData) {
          // Convert film data to form data format
          const formData: FilmFormData = {
            title: filmData.title || '',
            year: filmData.year?.toString() || '',
            director: filmData.director || '',
            genre: filmData.genre || '',
            runtime: filmData.runtime?.toString() || '',
            language: filmData.language || '',
            price: filmData.price?.toString() || '0.01', // Use actual price if available
            description: filmData.description || '',
            poster: filmData.poster || '',
            available: typeof filmData.available === 'boolean' ? filmData.available : true // Default to true
          }
          
          console.log('Initial film data loaded:', formData);
          setFilm(formData);
          setFormValues(formData);
          form.setFieldsValue(formData);
        } else {
          setError('Film not found')
        }
      } catch (err) {
        console.error('Error fetching film:', err)
        setError('Failed to load film data')
      }
    }

    if (id) {
      fetchFilm()
    }
    // Only run this effect once when component mounts
  }, [id])

  const handleFinish = async (values: FilmFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      console.log('Form values submitted:', values)
      
      // Make sure we have the original film data for reference
      if (!film) {
        throw new Error('Original film data is missing')
      }
      
      // Convert form data to film data format
      // Preserve the original title and poster URL as they should not be changed
      const filmData = {
        // Keep the original title and poster
        title: film.title,
        poster: film.poster,
        // Update the editable fields
        year: values.year,
        director: values.director,
        genre: values.genre,
        runtime: values.runtime,
        language: values.language,
        description: values.description,
        price: parseFloat(values.price), // Convert string to number
        available: values.available
      }
      
      console.log('Film data to update:', filmData)
      console.log('Film ID:', id)
      
      const updatedFilm = await updateFilm(id, filmData)
      console.log('Updated film response:', updatedFilm)
      
      message.success('Film updated successfully!')
      router.push('/staff/dashboard')
    } catch (err: any) {
      console.error('Error updating film:', err)
      setError('Failed to update film. ' + (err?.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = filmsLoading || authLoading || !film

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9fa' }}>
      <Card style={{ width: '100%', maxWidth: 600, margin: '40px auto', boxShadow: '0 2px 16px #dbeafe80', borderRadius: 12, padding: 0 }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>{film?.title || 'Edit Film'}</Typography.Title>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <img
            src={film?.poster || 'https://via.placeholder.com/140x200?text=No+Poster'}
            alt={film?.title}
            style={{ width: 120, height: 180, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #0001', background: '#fff', padding: 4 }}
          />
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={formValues || {}}
          onValuesChange={(changedValues, allValues) => {
            // Update form values when user makes changes
            setFormValues(prev => prev ? {...prev, ...changedValues} : allValues);
          }}
        >
          <Form.Item label="Film Name" name="title">
            <Input readOnly style={{ background: '#f5f5f5', fontWeight: 600, fontSize: 18 }} />
          </Form.Item>
          <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please enter year' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Runtime (min)" name="runtime" rules={[{ required: true, message: 'Please enter runtime' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Director" name="director">
            <Input />
          </Form.Item>
          <Form.Item label="Genre" name="genre">
            <Input />
          </Form.Item>
          <Form.Item label="Language" name="language">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="Poster URL" name="poster">
            <Input disabled style={{ background: '#f5f5f5', color: '#888' }} />
          </Form.Item>
          <Form.Item label="Price (ETH)" name="price" rules={[{ required: true, message: 'Please enter price' }]}>
            <Input type="number" min="0.01" step="0.01" />
          </Form.Item>
          <Form.Item label="Available for rent" name="available" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => router.push('/staff/dashboard')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Save</Button>
          </div>
          {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
        </Form>
      </Card>
    </div>
  )
}

// Export a wrapper component that properly unwraps params using React.use()
export default function EditFilmPage({ params }: { params: any }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params) as { id: string };
  return <EditFilmPageClient id={unwrappedParams.id} />;
}