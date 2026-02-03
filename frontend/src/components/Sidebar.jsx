import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart2, User, FilePlus, Users, Trophy, FileText } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const role = localStorage.getItem('role');

    let links = [];

    if (role === 'ADMIN') {
        links = [
            { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
            { name: 'Users', path: '/admin', icon: <Users size={20} /> }, // Can allow managing users
            { name: 'Settings', path: '/profile', icon: <User size={20} /> }
        ];
    } else if (role === 'TEACHER') {
        links = [
            { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={20} /> },
            { name: 'My Courses', path: '/teacher-courses', icon: <BookOpen size={20} /> },
            { name: 'My Exams', path: '/teacher-exams', icon: <FileText size={20} /> },
            { name: 'Create Exam', path: '/create-exam', icon: <FilePlus size={20} /> },
            { name: 'Students', path: '/students', icon: <Users size={20} /> },
            { name: 'Leaderboard', path: '/teacher-leaderboard', icon: <Trophy size={20} /> },
            { name: 'Profile', path: '/profile', icon: <User size={20} /> }
        ];
    } else {
        // STUDENT
        links = [
            { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
            { name: 'My Courses', path: '/student-courses', icon: <BookOpen size={20} /> },
            { name: 'My Exams', path: '/student-exams', icon: <FileText size={20} /> },
            { name: 'Results', path: '/results', icon: <BarChart2 size={20} /> },
            { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
            { name: 'Profile', path: '/profile', icon: <User size={20} /> }
        ];
    }

    return (
        <div className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 pt-16 hidden md:block border-r border-gray-100 z-20">
            <div className="px-6 py-4 border-b border-gray-50">
                <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">ParikshaSetu</Link>
            </div>
            <nav className="mt-6 space-y-1 px-3">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${location.pathname === link.path
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <span className="mr-3">{link.icon}</span>
                        <span>{link.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
