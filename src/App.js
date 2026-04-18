import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateForm from './pages/CreateForm';
import FormStats from './pages/FormStats';
import Notifications from './pages/Notifications';
import Leaderboard from './pages/Leaderboard';
import MyFines from './pages/MyFines';
import FinesManager from './pages/FinesManager';
import Layout from './components/Layout';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'student'
    ? <Navigate to="/student" />
    : <Navigate to="/teacher" />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/teacher" element={
          <PrivateRoute role="teacher">
            <Layout><TeacherDashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/teacher/create-form" element={
          <PrivateRoute role="teacher">
            <Layout><CreateForm /></Layout>
          </PrivateRoute>
        } />
        <Route path="/teacher/forms/:id/stats" element={
          <PrivateRoute role="teacher">
            <Layout><FormStats /></Layout>
          </PrivateRoute>
        } />
        <Route path="/teacher/fines" element={
          <PrivateRoute role="teacher">
            <Layout><FinesManager /></Layout>
          </PrivateRoute>
        } />

        <Route path="/student" element={
          <PrivateRoute role="student">
            <Layout><StudentDashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/student/fines" element={
          <PrivateRoute role="student">
            <Layout><MyFines /></Layout>
          </PrivateRoute>
        } />

        <Route path="/leaderboard" element={
          <PrivateRoute>
            <Layout><Leaderboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Layout><Notifications /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;