import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../services/ApiService";
import { useEffect, useState } from "react";
import HexLoader from "../../components/loader";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { ArrowUpDown } from "lucide-react";

const StudentExamInfo = () => {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [displayData, setDisplayData] = useState([]);
    const [isSorted, setIsSorted] = useState(false);
    const navigate = useNavigate()

    const loadSubmissions = async () => {
        try {
            setLoading(true)
            const res = await ApiService.get(`/api/submission/getSubmissions/${id}`);
            setSubmissions(res.result || []);
            setDisplayData(res.result || []);
            setIsSorted(false);
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

    const exportToExcel = () => {

        if (displayData.length === 0) return;

        const excelData = displayData.map((s, i) => {
            const percent =
                s.score > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0;

            return {
                "Sr No": i + 1,
                "Student Name": s.studentName,
                "Student Email": s.studentEmail,
                "Score": `${s.score} / ${s.totalMarks}`,
                "Percentage": percent + "%",
                "Status": percent >= 40 ? "PASS" : "FAIL",
                "Submitted At": new Date(s.createdAt).toLocaleString(),
            };
        });

        // ✅ create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // ===== AUTO COLUMN WIDTH =====
        const columnWidths = Object.keys(excelData[0]).map((key) => {
            const maxLength = Math.max(
                key.length,
                ...excelData.map(row => (row[key] ? row[key].toString().length : 0))
            );

            return { wch: maxLength + 4 }; // extra padding
        });

        worksheet["!cols"] = columnWidths;
        // ==============================

        // workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, "Exam_Submissions.xlsx");
    };

    const handlePercentageSort = () => {

    // if already sorted → reset
    if (isSorted) {
        setDisplayData(submissions);
        setIsSorted(false);
        return;
    }

    // sort highest percentage first
    const sorted = [...submissions].sort((a, b) => {
        const percentA = (a.score / a.totalMarks) * 100;
        const percentB = (b.score / b.totalMarks) * 100;
        return percentB - percentA;
    });

    setDisplayData(sorted);
    setIsSorted(true);
};

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ===== Top Header ===== */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>

                        <div className="flex space-x-2 items-center">
                            <div className="size-6 text-apple-blue">
                                <img src="/logorth.png" alt="_logo_" />
                            </div>
                            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                                Exam Submissions
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            View performance and attempts
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
                                Exam Submissions
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Total Attempts: {submissions.length}
                            </p>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="cursor-pointer px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                            Export Excel
                        </button>


                    </div>

                    {displayData.length === 0 ? (
                        <div className="p-14 text-center text-slate-400">
                            No submissions yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr className="text-left text-slate-500">
                                        <th className="px-6 py-3">#</th>
                                        <th className="px-6 py-3">Student Name</th>
                                        <th className="px-6 py-3">Student Email</th>
                                        <th className="px-6 py-3">Score</th>
                                        <th className="px-6 py-3 flex flex-row items-center">Percentage<ArrowUpDown size={14} onClick={handlePercentageSort} /></th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Submitted At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {displayData.map((s, i) => {
                                        const percent = s.score > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0;
                                        const pass = percent >= 40;

                                        return (
                                            <tr
                                                key={s.id}
                                                className="border-b last:border-b-0 hover:bg-slate-50 transition"
                                            >
                                                <td className="px-6 py-3 text-slate-500">{i + 1}</td>

                                                <td className="px-6 py-3 font-medium text-slate-800">
                                                    {s.studentName}
                                                </td>

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
