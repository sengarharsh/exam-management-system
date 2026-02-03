import React, { useEffect, useState } from 'react';
import api from '../api';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Results = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);

    useEffect(() => {
        fetchResults();
    }, [user]);

    const fetchResults = async () => {
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) return;

            const res = await api.get(`/api/results/student/${studentId}`);
            setResults(res.data);
        } catch (err) {
            console.error("Error fetching results", err);
        }
    };

    const downloadPDF = (result) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(59, 130, 246); // Blue color
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("ParikshaSetu - Result Report", 20, 25);

        // Student Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Student ID: ${result.studentId}`, 20, 50);
        doc.text(`Exam ID: ${result.examId}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);

        // Score Table
        doc.autoTable({
            startY: 80,
            head: [['Metric', 'Value']],
            body: [
                ['Total Score', result.score],
                ['Total Marks', result.totalMarks],
                ['Grade', result.grade],
                ['Percentage', `${((result.score / result.totalMarks) * 100).toFixed(2)}%`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Footer
        doc.setFontSize(10);
        doc.text("This is a computer-generated document.", 20, doc.lastAutoTable.finalY + 20);

        doc.save(`Result_Exam_${result.examId}.pdf`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Results</h1>

            {results.length === 0 ? <p className="text-gray-500">No results found.</p> : (
                <div className="grid gap-6">
                    {results.map((r) => (
                        <Card key={r.id}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Exam #{r.examId}</h3>
                                    <p className="text-sm text-gray-500">Completed on {r.generatedDate ? new Date(r.generatedDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${r.grade === 'A' ? 'bg-green-100 text-green-800' :
                                        r.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        Grade {r.grade}
                                    </span>
                                    <p className="font-medium">{r.score} / {r.totalMarks}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => downloadPDF(r)}
                                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Download size={16} className="mr-2" /> Download Report
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Results;
