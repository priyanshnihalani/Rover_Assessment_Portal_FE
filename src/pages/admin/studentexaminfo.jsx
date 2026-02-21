import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../services/ApiService";
import { useEffect, useState } from "react";
import HexLoader from "../../components/loader";

const StudentExamInfo = () => {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const loadSubmissions = async () => {
        try {
            setLoading(true)
            const res = await ApiService.get(`/api/submission/getSubmissions/${id}`);
            setSubmissions(res.result || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                <HexLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ===== Top Header ===== */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>

                        <div className="flex space-x-2 items-center">
                            <div className="size-6 text-apple-blue">
                                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="4"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                                Exam Submissions
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            View student performance and attempts
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            {/* ===== Content ===== */}
            <div className="p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm">

                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">
                                Student Exam Submissions
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Total Attempts: {submissions.length}
                            </p>
                        </div>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="p-14 text-center text-slate-400">
                            No submissions yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr className="text-left text-slate-500">
                                        <th className="px-6 py-3">#</th>
                                        <th className="px-6 py-3">Student Email</th>
                                        <th className="px-6 py-3">Score</th>
                                        <th className="px-6 py-3">Percentage</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Submitted At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {submissions.map((s, i) => {
                                        const percent = s.score > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0;
                                        const pass = percent >= 40;

                                        return (
                                            <tr
                                                key={s.id}
                                                className="border-b last:border-b-0 hover:bg-slate-50 transition"
                                            >
                                                <td className="px-6 py-3 text-slate-500">{i + 1}</td>

                                                <td className="px-6 py-3 font-medium text-slate-800">
                                                    {s.studentEmail}
                                                </td>

                                                <td className="px-6 py-3">
                                                    {s.score} / {s.totalMarks}
                                                </td>

                                                <td className="px-6 py-3">
                                                    {percent}%
                                                </td>

                                                <td className="px-6 py-3">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${pass
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-rose-50 text-rose-600"
                                                            }`}
                                                    >
                                                        {pass ? "PASS" : "FAIL"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-3 text-slate-500">
                                                    {new Date(s.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default StudentExamInfo;
