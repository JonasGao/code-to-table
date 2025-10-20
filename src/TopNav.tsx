import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconButton, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const TopNav: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get initial theme preference from system
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Don't render theme toggle until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
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
          <li><Link href="/netplan" style={{ color: '#fff', textDecoration: 'none' }}>Netplan配置生成</Link></li>
          <li><Link href="/iptables" style={{ color: '#fff', textDecoration: 'none' }}>iptables解析器</Link></li>
          <li><Link href="/ip-addr" style={{ color: '#fff', textDecoration: 'none' }}>IP地址解析器</Link></li>
        </ul>
      </nav>
    );
  }

  return (
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
        padding: 0,
        alignItems: 'center'
      }}>
        <li><Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>JSON Schema 解析器</Link></li>
        <li><Link href="/java-to-table" style={{ color: '#fff', textDecoration: 'none' }}>Java转表格</Link></li>
        <li><Link href="/docker-config" style={{ color: '#fff', textDecoration: 'none' }}>Docker配置生成</Link></li>
        <li><Link href="/netplan" style={{ color: '#fff', textDecoration: 'none' }}>Netplan配置生成</Link></li>
        <li><Link href="/iptables" style={{ color: '#fff', textDecoration: 'none' }}>iptables解析器</Link></li>
        <li><Link href="/ip-addr" style={{ color: '#fff', textDecoration: 'none' }}>IP地址解析器</Link></li>
        <li>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            aria-label="toggle theme"
            size="small"
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </li>
      </ul>
    </nav>
  );
};

export default TopNav;