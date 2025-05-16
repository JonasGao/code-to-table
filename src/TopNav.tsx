import React from 'react';

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
      <li><a href="#" style={{ color: '#fff', textDecoration: 'none' }}>首页</a></li>
      <li><a href="#" style={{ color: '#fff', textDecoration: 'none' }}>关于</a></li>
      <li><a href="#" style={{ color: '#fff', textDecoration: 'none' }}>联系</a></li>
    </ul>
  </nav>
);

export default TopNav;
