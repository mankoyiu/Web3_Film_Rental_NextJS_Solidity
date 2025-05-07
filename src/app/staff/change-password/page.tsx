"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, message, Spin } from "antd";
import { changePassword } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const { user, isStaff, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && (!user || (!isStaff && !isAdmin))) {
      message.error("You must be logged in as staff or admin to access this page");
      router.replace("/login");
    }
  }, [user, isStaff, isAdmin, router, isClient, authLoading]);

  // Show loading spinner while checking authentication
  if (!isClient || authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" tip="Checking authentication..." />
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen in useEffect)
  if (!user || (!isStaff && !isAdmin)) {
    return null;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log('Submitting password change for user:', user?.username);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success("Password changed successfully. Please log in again.");
      // Clear form after successful submission
      form.resetFields();
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err: any) {
      console.error('Password change error:', err);
      message.error(err?.message || "Failed to change password");
      // Only clear the password fields on error, not the whole form
      form.setFieldsValue({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <Card bordered style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Change Password
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Current Password" name="oldPassword" rules={[{ required: true, message: "Please enter your current password" }]}> 
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: "Please enter your new password" }, { min: 6, message: "Password must be at least 6 characters" }]}> 
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="Confirm New Password" name="confirmPassword" dependencies={["newPassword"]} rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
