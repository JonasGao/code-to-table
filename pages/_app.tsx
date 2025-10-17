import '../src/index.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProps } from 'next/app';
import { Box, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { darkTheme, lightTheme } from '../src/theme';

export default function App({ Component, pageProps }: AppProps) {
  // Get system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Create theme based on system preference
  const theme = useMemo(() => {
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        <Component {...pageProps} />
      </Box>
    </ThemeProvider>
  );
}