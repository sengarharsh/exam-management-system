import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Shield, TrendingUp, Users, ArrowRight } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            ParikshaSetu
                        </span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors px-4 py-2"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                            New Standard in Online Testing
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                            Smart & Secure <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Online Exams</span>
                        </h1>
                        <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            A seamless platform for conducting exams with integrity. AI-proctoring, instant grading, and detailed analytics for every student.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
                            >
                                Start for Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 text-lg font-semibold rounded-full hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
                            >
                                View Demo
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Image Collage */}
                    <div className="relative h-[400px] md:h-[500px]">
                        {/* Image 1: Top Right */}
                        <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-white p-2 rounded-2xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-500 z-10 border border-slate-100">
                            <img
                                src="/assets/img-study.png"
                                alt="Student Studying"
                                className="w-full h-full object-contain rounded-xl bg-slate-50"
                            />
                        </div>

                        {/* Image 2: Bottom Left */}
                        <div className="absolute bottom-10 left-0 w-56 h-56 md:w-72 md:h-72 bg-white p-2 rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-20 border border-slate-100">
                            <img
                                src="/assets/img-test.png"
                                alt="Online Test"
                                className="w-full h-full object-contain rounded-xl bg-slate-50"
                            />
                        </div>

                        {/* Image 3: Center Floating (Optional small decorative element) */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white p-3 rounded-full shadow-2xl z-30 animate-float border border-slate-100 flex items-center justify-center">
                            <img
                                src="/assets/img-success.png"
                                alt="Success Badge"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why ParikshaSetu?</h2>
                        <p className="text-lg text-slate-500">Everything needed for a smooth examination lifecycle.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-white" />}
                            color="bg-blue-600"
                            title="Secure Testing"
                            desc="Prevent cheating with browser locking and monitoring."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-white" />}
                            color="bg-purple-600"
                            title="Analytics"
                            desc="Track performance and identify areas for improvement."
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-white" />}
                            color="bg-pink-600"
                            title="Scalable"
                            desc="Built to support growing institutions effortlessly."
                        />
                    </div>
                </div>
            </div>

            {/* Social Proof / Stats - REALISTIC */}
            <div className="py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        <StatItem value="500+" label="Active Students" />
                        <StatItem value="50+" label="Exams Hosted" />
                        <StatItem value="98%" label="Completion Rate" />
                        <StatItem value="24/7" label="System Availability" />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to get started?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join us and streamline your assessment process today.
                    </p>
                    <button
                        onClick={() => navigate("/register")}
                        className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-blue-50 transition shadow-2xl hover:shadow-white/10"
                    >
                        Create Free Account
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">ParikshaSetu</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2026 ParikshaSetu Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, color, title, desc }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

const StatItem = ({ value, label }) => (
    <div className="p-4">
        <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600 mb-2">
            {value}
        </div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
);

export default LandingPage;
