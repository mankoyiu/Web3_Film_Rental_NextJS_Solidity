import { Layout, Typography, Space } from 'antd';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

export default function Footer() {
  return (
    <AntFooter className="artistic-footer" style={{ padding: '40px 0 16px 0', borderTop: 'none' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'center' }}>
        <Title level={4} style={{ marginBottom: 0, color: '#fff', letterSpacing: 2, textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Film Rental DApp</Title>
        <Text style={{ color: '#fff', fontSize: 16, opacity: 0.92 }}>A decentralized film rental platform built on blockchain technology.</Text>
        <Space direction="horizontal" size="large" style={{ margin: '12px 0' }}>
          <a href="mailto:support@filmrental.com" style={{ fontWeight: 500, fontSize: 15 }}>
            <i className="anticon anticon-mail" style={{ marginRight: 6 }} />Email
          </a>
          <a href="https://twitter.com/FilmRentalDApp" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, fontSize: 15 }}>
            <i className="anticon anticon-twitter" style={{ marginRight: 6 }} />Twitter
          </a>
          <a href="/about" style={{ fontWeight: 500, fontSize: 15 }}>
            <i className="anticon anticon-info-circle" style={{ marginRight: 6 }} />About
          </a>
        </Space>
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 13, opacity: 0.7, letterSpacing: 1 }}>
          &copy; {new Date().getFullYear()} Film Rental DApp. All rights reserved.
        </Text>
      </Space>
    </AntFooter>
  );
}