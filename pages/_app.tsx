import '../src/index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProps } from 'next/app';
import { Box } from '@mui/material';

// 创建一个主题
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        <Component {...pageProps} />
      </Box>
    </ThemeProvider>
  );
}