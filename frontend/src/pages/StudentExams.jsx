import React, { useEffect, useState } from 'react';
import api from '../api';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, PlayCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, UPCOMING, COMPLETED
    const navigate = useNavigate();

    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        if (studentId) {
            fetchExams();
        } else {
            setLoading(false);
            toast.error("User not found (Try logging in again)");
        }
    }, [studentId]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            // 1. Fetch Enrolled Courses
            const coursesRes = await api.get(`/api/courses/my/${studentId}`);
            const fetchedCourses = coursesRes.data;

            if (fetchedCourses.length > 0) {
                // 2. Fetch Exams for these courses
                const courseIds = fetchedCourses.map(c => c.courseId);
                const examsRes = await api.post('/api/exams/by-courses', courseIds);

                // 3. Fetch Results to know what's completed
                const resultsRes = await api.get(`/api/results/student/${studentId}`);
                const takenExamIds = new Set(resultsRes.data.map(r => r.examId));

                // Merge status
                const processedExams = examsRes.data.map(exam => {
                    const isTaken = takenExamIds.has(exam.id);
                    let status = 'UPCOMING';
                    const now = new Date();
                    const scheduled = new Date(exam.scheduledTime);

                    if (isTaken) {
                        status = 'COMPLETED';
                    } else if (scheduled <= now && exam.active) {
                        status = 'ACTIVE';
                    } else if (scheduled > now) {
                        status = 'UPCOMING';
                    } else {
                        status = 'EXPIRED';
                    }

                    return { ...exam, status, isTaken };
                });

                setExams(processedExams);
            } else {
                setExams([]);
            }
        } catch (error) {
            console.error('Error fetching exams', error);
            toast.error("Failed to load exams");
        } finally {
            setLoading(false);
        }
    };

    const getFilteredExams = () => {
        if (filter === 'ALL') return exams;
        return exams.filter(e => e.status === filter);
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><PlayCircle size={14} className="mr-1" /> LIVE NOW</span>;
            case 'COMPLETED':
                return <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} className="mr-1" /> COMPLETED</span>;
            case 'UPCOMING':
                return <span className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><Calendar size={14} className="mr-1" /> UPCOMING</span>;
            default:
                return <span className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">Ended</span>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your exams...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>

            {/* Filters */}
            <div className="flex gap-2 pb-4 border-b border-gray-100 overflow-x-auto">
                {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredExams().length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
                        <p className="text-gray-500 text-sm mt-1">There are no {filter !== 'ALL' ? filter.toLowerCase() : ''} exams at the moment.</p>
                    </div>
                ) : (
                    getFilteredExams().map(exam => (
                        <Card key={exam.id} className="hover:shadow-lg transition-shadow border border-slate-100 group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${exam.status === 'ACTIVE' ? 'bg-green-500' :
                                    exam.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}></div>

                            <div className="pl-2">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{exam.title}</h3>
                                    <StatusBadge status={exam.status} />
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock size={16} className="mr-2 text-gray-400" />
                                        {exam.durationMinutes} minutes
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar size={16} className="mr-2 text-gray-400" />
                                        {exam.scheduledTime ? new Date(exam.scheduledTime).toLocaleString() : 'Flexible Schedule'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CheckCircle size={16} className="mr-2 text-gray-400" />
                                        {exam.totalMarks} Marks
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/exam/${exam.id}`)}
                                    disabled={exam.status !== 'ACTIVE'}
                                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${exam.status === 'ACTIVE'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {exam.status === 'COMPLETED' ? 'View Results' :
                                        exam.status === 'ACTIVE' ? 'Start Exam' : 'Not Started'}
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentExams;
