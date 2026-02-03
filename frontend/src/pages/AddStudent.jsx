import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, BookOpen } from 'lucide-react';

const AddStudent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'STUDENT',
        courseId: ''
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            const teacherId = localStorage.getItem('userId');
            if (teacherId) {
                try {
                    const res = await api.get(`/api/courses/teacher/${teacherId}`);
                    setCourses(res.data);
                } catch (err) {
                    console.error("Failed to fetch courses");
                }
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.courseId) {
            toast.error("Please select a course for the student.");
            setLoading(false);
            return;
        }

        try {
            // 1. Register Student
            const registerRes = await api.post('/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: 'STUDENT'
            });

            const studentId = registerRes.data.id;

            // 2. Enroll in Course
            if (studentId && formData.courseId) {
                await api.post(`/api/courses/${formData.courseId}/enroll/${studentId}`);
            }

            toast.success("Student Added & Enrolled Successfully!");
            // Reset form
            setFormData({ fullName: '', email: '', password: '', role: 'STUDENT', courseId: '' });
            navigate('/teacher'); // Redirect to dashboard
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to add student.";
            if (msg.includes("Email already exists")) {
                // If email exists, try to enroll existing user logic or just filtering
                // For now, just show error as per standard flow
                toast.error(msg);
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Student</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="fullName" value={formData.fullName} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="Student Name" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="email" type="email" value={formData.email} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="student@example.com" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="password" type="text" value={formData.password} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="Set a temporary password" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Assign to Course</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            required
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border"
                        >
                            <option value="">-- Select a Course --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title} ({course.code})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate('/teacher')} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {loading ? 'Adding...' : 'Add & Enroll'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
