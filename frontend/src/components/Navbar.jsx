import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Navbar = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth() || {};
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const role = localStorage.getItem('role');

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 60s
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Adjust endpoint as per backend. Assuming /api/notifications
            const res = await api.get(`/api/notifications/user/${user.id}`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
            // Mock for UI demonstration if backend empty
            setNotifications([
                { id: 1, message: "Welcome to ParikshaSetu!", time: "Now" }
            ]);
            setUnreadCount(1);
        }
    };

    return (
        <header className="h-16 bg-white shadow-sm fixed top-0 w-full z-30 flex items-center justify-between px-6 md:pl-72 transition-all duration-300">
            <div className="text-gray-500 text-sm md:text-base font-medium flex items-center gap-2">
                <span>Welcome back,</span>
                <span className="font-bold text-blue-600">{role}</span>
                <span className="text-gray-900 font-semibold">{user?.fullName || localStorage.getItem('fullName') || ''}</span>
            </div>
            <div className="flex items-center space-x-6">

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-gray-400 hover:text-blue-600 transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-semibold text-sm text-gray-700">Notifications</span>
                                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, idx) => (
                                        <div key={idx} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer">
                                            <p className="text-sm text-gray-800">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time || 'Just now'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white shadow-sm">
                        {role ? role.charAt(0) : 'U'}
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                        <LogOut size={16} className="mr-1" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
