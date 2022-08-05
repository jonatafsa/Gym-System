import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navigation from './components/navigation';
import { useAuth } from './hooks/use-auth';
import EditModalities from './pages/edit-modalities';
import Gym from './pages/gym';
import Home from './pages/home';
import InsertNewEmployee from './components/insert-new-Employee';
import InsertNewModalitie from './components/insert-new-modalities';
import InsertNewUser from './pages/insert-new-user';
import Login from './pages/login';
import User from './pages/user';
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
            path="edit-modalities"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <EditModalities />
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

          <Route
            path="user"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <User />
              </ProtectedRoute>
            } />

          <Route
            path="gym"
            element={
              <ProtectedRoute user={user?.refreshToken}>
                <Gym />
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