import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash, Upload, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/api/users/students');
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/api/users/${id}`);
                setStudents(students.filter(student => student.id !== id));
                toast.success('Student deleted successfully');
            } catch (error) {
                console.error('Failed to delete student', error);
                toast.error('Failed to delete student');
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            await api.post('/api/users/students/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Students uploaded successfully');
            setShowUploadModal(false);
            setFile(null);
            fetchStudents();
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to upload students');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-6">Loading Students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Students Directory</h2>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                >
                    <Upload size={16} />
                    Upload Excel
                </button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No students found.</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{student.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.verified || student.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {student.verified || student.status === 'APPROVED' ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Students">
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-900">
                        <h4 className="font-bold mb-2">Instructions:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Column A: Full Name</li>
                            <li>Column B: Email</li>
                            <li>Column C: Password (Optional, default: 123456)</li>
                        </ul>
                        <button
                            type="button"
                            onClick={() => window.open("http://localhost:8080/api/users/students/template", "_blank")}
                            className="mt-2 text-blue-600 underline font-semibold flex items-center text-xs"
                        >
                            <Download size={14} className="mr-1" /> Download Template
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <label className="mt-2 block text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500">
                            <span>Select Excel File</span>
                            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                        {file && <p className="mt-2 text-sm text-gray-500">{file.name}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {uploading ? 'Uploading...' : 'Upload Students'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
