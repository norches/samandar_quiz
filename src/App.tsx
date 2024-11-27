import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Page1 />} />
          <Route path="/quiz" element={<Page2 />} />
          <Route path="/result" element={<Page3 />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
