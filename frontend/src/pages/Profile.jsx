import React, { useState } from 'react';
import Card from '../components/Card';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, role } = useAuth();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setLoading(true);
        try {
            // Adjust endpoint as needed
            await api.post('/api/auth/change-password', {
                userId: user.id || 1, // Fallback if id missing (should be there)
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Password changed successfully");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info Card */}
                <Card title="Personal Information">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                            {role ? role.charAt(0) : 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.fullName || localStorage.getItem('fullName') || 'User Name'}</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                            <User className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{user?.fullName || localStorage.getItem('fullName') || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Mail className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{user?.email || localStorage.getItem('email') || 'user@example.com'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Shield className="h-5 w-5 mr-3 text-gray-400" />
                            <span>Account Status: Active</span>
                        </div>
                    </div>
                </Card>

                {/* Change Password Card */}
                <Card title="Security Settings">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="password" name="current" required
                                    value={passwords.current} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="password" name="new" required
                                    value={passwords.new} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="password" name="confirm" required
                                    value={passwords.confirm} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
