import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Assistant } from './pages/Assistant';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Focus } from './pages/Focus';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
          <main className="flex-grow flex flex-col w-full">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/focus" 
                element={
                  <ProtectedRoute>
                    <Focus />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assistant" 
                element={
                  <ProtectedRoute>
                    <Assistant />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </ErrorBoundary>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
