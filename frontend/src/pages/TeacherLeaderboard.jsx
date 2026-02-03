import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { Trophy, Filter } from 'lucide-react';

const TeacherLeaderboard = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get(`/api/courses/teacher/${teacherId}`);
                setCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourseId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch courses");
            }
        };
        fetchCourses();
    }, [teacherId]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchRankings(selectedCourseId);
        }
    }, [selectedCourseId]);

    const fetchRankings = async (courseId) => {
        setLoading(true);
        try {
            // 1. Get all exams for this course
            // The endpoint we need is to find exams filtered by course (or filter locally if we fetch all)
            // But we can use api.post('/api/exams/by-courses', [courseId]) which we already have!
            const examsRes = await api.post('/api/exams/by-courses', [courseId]);
            const exams = examsRes.data;
            const examIds = exams.map(e => e.id);

            if (examIds.length === 0) {
                setRankings([]);
                setLoading(false);
                return;
            }

            // 2. Fetch results for these exams (Batch fetch)
            const resultsRes = await api.post('/api/results/by-exams', examIds);
            const results = resultsRes.data;

            // 3. Fetch all students (to map names) - Optimization: Fetch users only needed or fetch all students once
            // For now, simpler to fetch all students or we rely on some student cache.
            // Let's fetch all students for simplicity as user base is small, or fetch by ids if User service supports it.
            // Use existing endpoint
            const studentsRes = await api.get('/api/users/students');
            const students = studentsRes.data;

            // 4. Calculate Total Scores
            const userScores = {};
            results.forEach(r => {
                if (!userScores[r.studentId]) userScores[r.studentId] = 0;
                userScores[r.studentId] += r.score;
            });

            // 5. Map to Rankings
            const sorted = Object.keys(userScores)
                .map(id => {
                    const student = students.find(s => s.id === parseInt(id));
                    return {
                        id: id,
                        name: student ? student.fullName : `Student #${id}`,
                        email: student ? student.email : '',
                        score: userScores[id]
                    };
                })
                .sort((a, b) => b.score - a.score)
                .map((item, index) => ({ ...item, rank: index + 1 }));

            setRankings(sorted);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Trophy className="mr-3 text-yellow-500" /> Class Leaderboard
                </h1>

                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="block w-64 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                    </select>
                </div>
            </div>

            <Card>
                {loading ? <p className="text-center py-4">Loading rankings...</p> : rankings.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">No results found for this course yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map((r, idx) => (
                                    <tr key={r.id} className={idx < 3 ? 'bg-yellow-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-white ${idx === 0 ? 'bg-yellow-500' :
                                                    idx === 1 ? 'bg-gray-400' :
                                                        idx === 2 ? 'bg-orange-400' : 'bg-blue-200 text-blue-800'
                                                }`}>
                                                {r.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeacherLeaderboard;
