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
import WeeklyReport from './pages/reports';

export default function MyRoutes() {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home />} />

        <Route
          path="insert-new-user"
          element={<InsertNewUser />} />

        <Route
          path="edit-modalities"
          element={<EditModalities />} />

        <Route
          path="user-manager"
          element={<UserManager />} />


        <Route
          path="external-values"
          element={<ExternalValues />} />

        <Route
          path="user"
          element={<User />} />

        <Route
          path="gym"
          element={<Gym />} />

        <Route
          path="reports"
          element={<WeeklyReport />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

const ProtectedRoute = ({ children }: any) => {
  const token = Cookies.get('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children;
}