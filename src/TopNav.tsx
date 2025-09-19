import React from 'react';
import Link from 'next/link';

const TopNav: React.FC = () => (
  <nav style={{
    width: '100%',
    background: '#333',
    color: '#fff',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    borderBottom: '2px solid #555'
  }}>
    <ul style={{
      listStyle: 'none',
      display: 'flex',
      gap: '2rem',
      margin: 0,
      padding: 0
    }}>
      <li><Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>JSON Schema 解析器</Link></li>
      <li><Link href="/java-to-table" style={{ color: '#fff', textDecoration: 'none' }}>Java转表格</Link></li>
      <li><Link href="/docker-config" style={{ color: '#fff', textDecoration: 'none' }}>Docker配置生成</Link></li>
    </ul>
  </nav>
);

export default TopNav;
