import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ exams: 0, students: 0, avgScore: 0, results: [], rankings: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [examsRes, studentsRes, resultsRes] = await Promise.all([
                api.get('/api/exams'),
                api.get('/api/users/students'),
                api.get('/api/results')
            ]);

            const exams = examsRes.data;
            const students = studentsRes.data;
            const results = resultsRes.data;

            const avg = results.length > 0
                ? Math.round(results.reduce((acc, curr) => acc + ((curr.score / curr.totalMarks) * 100), 0) / results.length)
                : 0;



            // Calculate Rankings
            const userScores = {};
            results.forEach(r => {
                if (!userScores[r.studentId]) userScores[r.studentId] = 0;
                userScores[r.studentId] += r.score;
            });

            const rankings = Object.keys(userScores).map(id => {
                const s = students.find(u => u.id === parseInt(id));
                return {
                    id,
                    name: s ? s.fullName : 'Unknown',
                    score: userScores[id]
                };
            }).sort((a, b) => b.score - a.score).slice(0, 5);

            setStats({
                exams: exams.length,
                students: students.length,
                avgScore: avg,
                results: results.slice(0, 5),
                rankings
            });
        } catch (error) {
            console.error("Failed to load teacher stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Teacher Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/create-exam')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        + Create New Exam
                    </button>
                    <button
                        onClick={() => navigate('/add-student')}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
                    >
                        + Add Student
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.exams}</dd>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.students}</dd>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Score</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.avgScore + '%'}</dd>
                    </div>
                </Card>
            </div>

            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Submissions</h2>
            <Card>
                {/* <p className="text-gray-500 text-sm text-center py-4">No recent submissions found.</p> */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.results && stats.results.length > 0 ? (
                                stats.results.map((res) => (
                                    <tr key={res.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.examId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.score} / {res.totalMarks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {res.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No submissions yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8">Top Performing Students</h2>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.rankings && stats.rankings.length > 0 ? (
                                stats.rankings.map((r, idx) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-200 text-blue-800'}`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.score}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TeacherDashboard;
