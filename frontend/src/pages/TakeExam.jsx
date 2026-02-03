import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import ExamTimer from "../components/ExamTimer";
import { AlertTriangle } from "lucide-react";
import { useAuth } from '../context/AuthContext';

function TakeExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [warnings, setWarnings] = useState(0);

    useEffect(() => {
        fetchExam();

        // Request Full Screen
        const enterFullScreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                    await document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
                    await document.documentElement.msRequestFullscreen();
                }
            } catch (err) {
                console.warn("Full screen request denied/failed", err);
            }
        };
        enterFullScreen();

        // Restore answers
        const saved = localStorage.getItem(`exam_answers_${id}`);
        if (saved) setAnswers(JSON.parse(saved));

        // Tab Switch logic...
        const handleVisibilityChange = () => {
            // ... existing logic ...
            if (document.hidden) {
                setWarnings(prev => {
                    const newCount = prev + 1;
                    alert(`WARNING: Tab switch detected! Warning ${newCount}/3.\nAt 3 warnings, exam will auto-submit.`);
                    if (newCount >= 3) {
                        handleSubmit(true);
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    const fetchExam = async () => {
        try {
            const res = await api.get(`/api/exams/${id}`);
            setExam(res.data);
        } catch (error) {
            console.error(error);
            alert("Failed to load exam");
        }
    };

    const handleChange = (qId, option) => {
        const newAnswers = { ...answers, [qId]: option };
        setAnswers(newAnswers);
        localStorage.setItem(`exam_answers_${id}`, JSON.stringify(newAnswers));
    };

    const handleSubmit = async (forced = false) => {
        if (!forced && !window.confirm("Are you sure you want to submit?")) return;

        setSubmitting(true);
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) {
                alert("Error: Student ID not found. Please re-login.");
                setSubmitting(false);
                return;
            }

            // Start submission session
            const start = await api.post(`/api/submissions/start?examId=${exam.id}&studentId=${studentId}`);
            const submissionId = start.data.id;

            let score = 0;
            exam.questions.forEach(q => {
                if (answers[q.id] === q.correctOption) score += q.marks;
            });

            await api.post(`/api/submissions/${submissionId}/submit`, { score });

            if (forced) alert("Exam Auto-Submitted due to violations.");
            else alert(`Exam Submitted! Your Score: ${score}`);

            localStorage.removeItem(`exam_answers_${id}`);
            const role = localStorage.getItem('role');
            navigate(role === 'STUDENT' ? "/student" : "/dashboard");

        } catch (err) {
            console.error(err);
            alert("Submit Failed: " + (err.response?.data?.message || err.message));
            setSubmitting(false);
        }
    };

    if (!exam) return <div className="p-10">Loading exam...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="bg-white shadow-lg rounded-2xl mb-6 sticky top-20 z-10 border border-slate-200">
                <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{exam.title}</h2>
                        <div className="flex items-center mt-2">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                                    {exam.questions.length} Questions
                                </span>
                                <span>•</span>
                                <span>{exam.totalMarks} Total Marks</span>
                            </div>
                            {warnings > 0 && <span className="ml-4 text-red-600 font-bold flex items-center text-sm border border-red-200 bg-red-50 px-2 py-0.5 rounded"><AlertTriangle size={16} className="mr-1" /> Warnings: {warnings}/3</span>}
                        </div>
                    </div>
                    <div>
                        <ExamTimer durationMinutes={exam.durationMinutes} onTimeUp={() => handleSubmit(true)} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {exam.questions.map((q, i) => (
                    <div key={q.id} className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-start">
                            <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold mr-4">{i + 1}</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{q.text}</h3>
                                <div className="space-y-3">
                                    {["A", "B", "C", "D"].map(opt => (
                                        <label key={opt} className={`flex items-center p-3 rounded-lg border cursor-pointer ${answers[q.id] === opt ? 'bg-blue-50 border-blue-500' : 'border-gray-200'}`}>
                                            <input type="radio" value={opt} checked={answers[q.id] === opt} onChange={() => handleChange(q.id, opt)} className="h-4 w-4 text-blue-600" />
                                            <span className="ml-3 text-sm font-medium text-gray-700">{q["option" + opt]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-end pb-20">
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className={`px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {submitting ? 'Submitting...' : 'Submit Answers'}
                </button>
            </div>
        </div>
    );
}

export default TakeExam;
