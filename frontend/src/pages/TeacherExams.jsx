import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { Trash, Eye, Users, CheckCircle, Clock } from 'lucide-react';

const TeacherExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState({});
    const [stats, setStats] = useState({}); // { examId: attemptCount }

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const teacherId = localStorage.getItem('userId');
            const [examRes, courseRes] = await Promise.all([
                api.get(`/api/exams/teacher/${teacherId}`),
                api.get(`/api/courses/teacher/${teacherId}`)
            ]);

            setExams(examRes.data);

            // Map courses for easy lookup
            const courseMap = {};
            courseRes.data.forEach(c => courseMap[c.id] = c.title);
            setCourses(courseMap);

            // Fetch attempt counts for each exam
            const newStats = {};
            await Promise.all(examRes.data.map(async (exam) => {
                try {
                    const res = await api.get(`/api/results/exam/${exam.id}`);
                    newStats[exam.id] = res.data.length;
                } catch (e) {
                    newStats[exam.id] = 0;
                }
            }));
            setStats(newStats);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load exams");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/exams/${examId}`);
            toast.success("Exam deleted successfully");
            setExams(exams.filter(e => e.id !== examId));
        } catch (err) {
            toast.error("Failed to delete exam");
        }
    };

    const getStatus = (exam) => {
        // Logic: active if current time < scheduledTime + duration
        // Assuming exam.scheduledTime is ISO string. If null, maybe it's always active or handled differently.
        // For this system, let's assume if it exists it's "Live" or "Scheduled".
        // Use a simple heuristic: if it has attempts, it's "Active". 
        // Or strictly time based?
        // Let's stick to user request: "Live/Completed"

        // Actually, without strict scheduling enforcement, let's just use "Active" by default
        // But user asked for "Live / Completed"
        // Let's say Completed if scheduledTime + duration < Now.

        if (!exam.scheduledTime) return "Active";

        const end = new Date(new Date(exam.scheduledTime).getTime() + exam.durationMinutes * 60000);
        if (new Date() > end) return "Completed";
        return "Live";
    };

    if (loading) return <div className="p-8">Loading exams...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>

            {exams.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No exams created yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {exams.map(exam => {
                        const status = getStatus(exam);
                        return (
                            <div key={exam.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-center">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{exam.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className="flex items-center"><Clock size={16} className="mr-1" /> {exam.durationMinutes} mins</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded">Course: {courses[exam.courseId] || 'Unknown'}</span>
                                        <span className={`px-2 py-1 rounded flex items-center ${status === 'Live' || status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {status === 'Live' || status === 'Active' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                                            {status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div className="text-center px-4">
                                        <div className="text-2xl font-bold text-blue-600">{stats[exam.id] || 0}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Attempts</div>
                                    </div>

                                    <div className="border-l pl-6">
                                        <button
                                            onClick={() => handleDelete(exam.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                                            title="Delete Exam"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TeacherExams;
