import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { InterviewProvider } from './context/InterviewContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Background } from './components/Background.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Reveal from './components/Reveal.jsx';
import { Home } from './pages/Home.jsx';
import { Interview } from './pages/Interview.jsx';
import { Report } from './pages/Report.jsx';
import { History } from './pages/History.jsx';
import { NotFound } from './pages/NotFound.jsx';

function App() {
  return (
    <ThemeProvider>
      <InterviewProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white">
            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Interactive Neural Network Background */}
            <Background />

            {/* Global Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/report" element={<Report />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Global Hot Toast Container */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, #ffffff)',
                  color: 'var(--toast-color, #1e293b)',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.1)',
                  fontSize: '13px',
                  fontWeight: 500
                },
                success: {
                  iconTheme: {
                    primary: '#6366f1',
                    secondary: '#ffffff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff'
                  }
                }
              }}
            />
          </div>
        </Router>
      </InterviewProvider>
    </ThemeProvider>
  );
}

export default App;
