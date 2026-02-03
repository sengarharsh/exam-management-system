import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Analytics from '../components/Analytics';
import { useAuth } from '../context/AuthContext';


function StudentDashboard() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]); // Added state for debug
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        fetchResults();
    }, [user]);

    const fetchExams = async () => {
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) {
                console.error("Student ID not found in context or localStorage");
                return;
            }

            // 1. Fetch Enrolled Courses
            console.log("Fetching courses for student:", studentId);
            const coursesRes = await api.get(`/api/courses/my/${studentId}`);
            const fetchedCourses = coursesRes.data;
            console.log("Fetched courses:", fetchedCourses);
            setCourses(fetchedCourses); // Store for UI

            if (fetchedCourses.length > 0) {
                // 2. Fetch Exams for these courses
                const courseIds = fetchedCourses.map(c => c.courseId);
                console.log("Fetching exams for course IDs:", courseIds);
                const examsRes = await api.post('/api/exams/by-courses', courseIds);
                console.log("Fetched exams:", examsRes.data);
                setExams(examsRes.data);
            } else {
                console.log("No enrolled courses found for student.");
                setExams([]);
            }
        } catch (error) {
            console.error('Error fetching exams', error);
        }
    };

    const fetchResults = async () => {
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) return;

            const res = await api.get(`/api/results/student/${studentId}`);
            setResults(res.data);
        } catch (err) {
            console.log("Result fetch error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Overview of your activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">📚</div>
                        <div className="text-lg font-bold">{exams.length}</div>
                        <div className="text-gray-500">Available Exams</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">✅</div>
                        <div className="text-lg font-bold">{results.length}</div>
                        <div className="text-gray-500">Exams Taken</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">🏆</div>
                        <div className="text-lg font-bold">TOP 10%</div>
                        <div className="text-gray-500">Current Rank</div>
                    </div>
                </Card>
            </div>

            {/* Analytics Component */}
            {/* Analytics Component */}
            {/* <Analytics results={results} /> */}

            <div className="grid grid-cols-1 gap-6">
                <Card title="Available Exams">
                    {/* Debug Info */}


                    {courses.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            <p>You are not enrolled in any courses.</p>
                            <button onClick={() => navigate('/student-courses')} className="mt-2 text-blue-600 underline">Browse Courses</button>
                        </div>
                    ) : exams.filter(e => !results.some(r => r.examId === e.id)).length === 0 ? (
                        <p className="text-gray-500">No exams found for your enrolled courses.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {exams.filter(e => !results.some(r => r.examId === e.id)).map(exam => (
                                <li key={exam.id} className="py-6 flex justify-between items-center hover:bg-gray-50 transition-colors px-4 rounded-lg -mx-4 group">
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{exam.title}</p>
                                        <div className="flex items-center mt-1 text-gray-500">
                                            <span className="mr-4">⏱ {exam.durationMinutes} mins</span>
                                            <span>📝 {exam.totalMarks} Marks</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/exam/${exam.id}`)}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5"
                                    >
                                        Start
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Recent Results">
                    {results.length === 0 ? <p className="text-gray-500">No results yet.</p> : (
                        <ul className="divide-y divide-gray-200">
                            {results.map(r => (
                                <li key={r.id} className="py-4 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Exam #{r.examId}</p>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{r.grade}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Score: {r.score}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default StudentDashboard;
