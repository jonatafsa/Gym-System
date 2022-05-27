import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navigation from './components/navigation';
import { useAuth } from './hooks/use-auth';
import EditModalities from './pages/edit-modalities';
import Home from './pages/home';
import InsertNewEmployee from './pages/insert-new-Employee';
import InsertNewModalitie from './pages/insert-new-modalities';
import InsertNewUser from './pages/insert-new-user';
import Login from './pages/login';
import UserManager from './pages/user-manager';

import ExternalValues from './pages/values-external';

export default function MyRoutes() {
  const { user } = useAuth()

  return (
    <Router>
      <div className="content">

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <Home />
              </ProtectedRoute>
            } />

          <Route
            path="insert-new-user"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <InsertNewUser />
              </ProtectedRoute>
            } />

          <Route
            path="insert-new-modalitie"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <InsertNewModalitie />
              </ProtectedRoute>
            } />


          <Route
            path="edit-modalities"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <EditModalities />
              </ProtectedRoute>
            } />

          <Route
            path="insert-new-employee"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <InsertNewEmployee />
              </ProtectedRoute>
            } />

          <Route
            path="user-manager"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <UserManager />
              </ProtectedRoute>
            } />

            
          <Route
            path="external-values"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <ExternalValues />
              </ProtectedRoute>
            } />

          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

const ProtectedRoute = ({ user, children }: any) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}