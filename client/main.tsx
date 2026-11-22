import React from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import App from './App'
import './style.css'
const theme = createTheme({
  palette: {
    primary: { main: '#166052' },
    background: { default: '#f5f5ef' },
    text: { primary: '#173c35' },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 5 },
  components: { MuiButton: { defaultProps: { disableElevation: true } } },
})
createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
)
