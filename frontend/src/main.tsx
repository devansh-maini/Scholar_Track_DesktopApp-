import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ApiError } from './lib/api';
import { AuthProvider } from './state/auth';
import { LiveProvider } from './state/live';
import { ThemeProvider } from './state/theme';
import { ToastProvider } from './state/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      // retry only network hiccups, never 4xx answers
      retry: (count, err) => (err instanceof ApiError && err.status !== 0 ? false : count < 2),
    },
  },
});

// HashRouter so the app also works when Electron loads it from a file:// URL.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <LiveProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </LiveProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
