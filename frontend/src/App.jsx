import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import CreateExam from './pages/CreateExam';
import AddStudent from './pages/AddStudent';
import TakeExam from "./pages/TakeExam";
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';
import Students from './pages/Students';
import TeacherCourses from './pages/TeacherCourses';
import TeacherExams from './pages/TeacherExams';
import StudentCourses from './pages/StudentCourses';
import StudentExams from './pages/StudentExams';
import TeacherLeaderboard from './pages/TeacherLeaderboard';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';


function App() {
  const role = localStorage.getItem('role');

  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Layout */}
          {/* Protected Routes with Layout */}
          <Route
            path="/admin"
            element={<Layout><AdminDashboard /></Layout>}
          />
          <Route
            path="/teacher"
            element={<Layout><TeacherDashboard /></Layout>}
          />
          <Route
            path="/teacher-courses"
            element={<Layout><TeacherCourses /></Layout>}
          />
          <Route
            path="/teacher-exams"
            element={<Layout><TeacherExams /></Layout>}
          />
          <Route
            path="/student"
            element={<Layout><StudentDashboard /></Layout>}
          />
          <Route
            path="/student-courses"
            element={<Layout><StudentCourses /></Layout>}
          />
          <Route
            path="/student-exams"
            element={<Layout><StudentExams /></Layout>}
          />

          {/* Fallback for legacy dashboard link */}
          <Route
            path="/dashboard"
            element={<Navigate to={role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student'} replace />}
          />
          <Route
            path="/create-exam"
            element={
              <Layout>
                <CreateExam />
              </Layout>
            }
          />
          <Route
            path="/add-student"
            element={
              <Layout>
                <AddStudent />
              </Layout>
            }
          />
          <Route
            path="/exam/:id"
            element={<Layout><TakeExam /></Layout>}
          />
          <Route
            path="/profile"
            element={<Layout><Profile /></Layout>}
          />
          <Route
            path="/results"
            element={<Layout><Results /></Layout>}
          />
          <Route
            path="/leaderboard"
            element={<Layout><Leaderboard /></Layout>}
          />
          <Route
            path="/students"
            element={<Layout><Students /></Layout>}
          />
          <Route
            path="/teacher-leaderboard"
            element={<Layout><TeacherLeaderboard /></Layout>}
          />

          <Route
            path="/admin"
            element={<Layout><AdminDashboard /></Layout>}
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
