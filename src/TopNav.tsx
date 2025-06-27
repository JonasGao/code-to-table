import React from 'react';
import { Link } from 'react-router-dom';

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
    zIndex: 1000
  }}>
    <ul style={{
      listStyle: 'none',
      display: 'flex',
      gap: '2rem',
      margin: 0,
      padding: 0
    }}>
      <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>首页</Link></li>
      <li><Link to="/java-to-table" style={{ color: '#fff', textDecoration: 'none' }}>Java转表格</Link></li>
    </ul>
  </nav>
);

export default TopNav;
