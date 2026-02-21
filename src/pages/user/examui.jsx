import { ArrowLeftCircle, ArrowRightCircle, Flag, FlagOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiService } from "../../services/ApiService";
import { getCookie, setCookie, deleteCookie } from "../../helper/cookie"
import HexLoader from "../../components/loader";


export default function ExamUI() {
    const [timeLeft, setTimeLeft] = useState(0);
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const current = questions.length > 0 ? questions[currentIndex] : null;

    const data = location?.state;
    if (!data || !data.form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-6">
                    <div className="text-4xl">⚠️</div>

                    <h1 className="text-lg font-semibold text-slate-900">
                        Session Expired
                    </h1>

                    <p className="text-sm text-slate-500 leading-relaxed">
                        Your exam session is not valid or has expired.
                        Please re-enter your email and paper code.
                    </p>

                    <div className="pt-4 border-t">
                        <button
                            onClick={() => navigate("/")}
                            className="cursor-pointer w-full py-2.5 rounded-lg bg-apple-blue hover:bg-[#0071e3] text-white text-sm font-medium  transition"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const { name, email, code } = data?.form;
    const [result, setResult] = useState({})
    const [success, setSuccess] = useState(null)
    const [submitted, setSubmitted] = useState(false);

    const selectOption = (i) => {
        setAnswers((prev) => ({
            ...prev,
            [current.id]: i,
        }));
    };

    const toggleFlag = () => {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(current.id)) next.delete(current.id);
            else next.add(current.id);
            return next;
        });
    };

    const loadPaper = async () => {

        try {
            setLoading(true)
            const result = await ApiService.post('/api/paper/start', { name, email, code });

            setSuccess(true)
            if (result.data?.alreadySubmitted) {
                setResult({ score: result?.data?.score, total: result?.data?.total })
                return
            }

            const savedTime = getCookie("exam_time_left");
            const initialTime = savedTime
                ? Number(savedTime)
                : result.data.timeLimit * 60;

            setTimeLeft(initialTime);

            if (!savedTime) {
                setCookie("exam_time_left", initialTime, result.data.timeLimit);
            }

            setTitle(result.data.title);

            const formatted = result?.data?.questions?.map((q) => ({
                id: q.id,
                question: q.prompt,
                options: q?.options?.map((o) => `${o.label}. ${o.text}`),
            }));

            setQuestions(formatted);
        }
        catch (err) {
            if (!err.response.data.success) {
                setSuccess(false)
            }
        }
        finally {
            setLoading(false)
        }
    };


    useEffect(() => {
        loadPaper()
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((t) => {
                const next = t - 1;
                setCookie("exam_time_left", next, 60);
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const submitExam = async () => {
        try {
            setLoading(true)
            const payloadAnswers = Object.entries(answers).map(
                ([questionId, selectedOption]) => ({
                    questionId: questionId,
                    selectedOption: String.fromCharCode(65 + selectedOption),
                })
            );

            const payload = {
                code,
                studentName: name,
                studentEmail: email,
                answers: payloadAnswers,
            };

            const res = await ApiService.post("/api/submission/submit", payload)
            setResult(res.result)
            
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        finally {
            setLoading(false)
        }
    };

    const savedTime = getCookie("exam_time_left");

    useEffect(() => {
        if (savedTime && timeLeft <= 0 && !submitted && success === true) {
            setSubmitted(true);
            submitExam();
            deleteCookie("exam_time_left")
        }
    }, [timeLeft, submitted, success]);

    return (
        <>

            {
                loading ? <HexLoader /> :
                    <>
                        {
                            success === false &&
                            (<div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-6">

                                    <div className="text-4xl">⚠️</div>

                                    <h1 className="text-lg font-semibold text-slate-900">
                                        Invalid Question Paper
                                    </h1>

                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        The question paper code you entered is not valid or has expired.
                                        Please check the code and try again.
                                    </p>

                                    <div className="pt-4 border-t">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="cursor-pointer w-full py-2.5 rounded-lg bg-apple-blue hover:bg-[#0071e3] text-white text-sm font-medium  transition"
                                        >
                                            Enter Valid Question Paper
                                        </button>
                                    </div>

                                </div>
                            </div>)
                        }
                        {success === true && Object.keys(result).length > 0 &&
                            (<div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-6">

                                    <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                                        Exam Result
                                    </h1>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-5xl font-bold text-slate-900">
                                            {result.score}
                                            <span className="text-slate-400 text-2xl"> / {result.total}</span>
                                        </div>

                                        <p className="text-sm text-slate-500">
                                            {result.total > 0
                                                ? Math.round((result.score / result.total) * 100)
                                                : 0}
                                            % Score
                                        </p>
                                    </div>

                                    <div
                                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${result.score / result.total >= 0.4
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                                            }`}
                                    >
                                        {
                                            result.total > 0
                                                ? (result.score / result.total) >= 0.35
                                                    ? "PASS"
                                                    : "FAIL"
                                                : "FAIL"
                                        }
                                    </div>

                                </div>
                            </div>)
                        }
                        {success === true && Object.keys(result).length === 0 && (
                            <div className=" bg-white text-slate-800">
                                <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3 sm:py-4">
                                    <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                        {/* Left */}
                                        <div className="flex flex-col">
                                            <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
                                                Final Assessment: {title}
                                            </h1>
                                            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
                                                Question {currentIndex + 1} of {questions.length}
                                            </p>
                                        </div>

                                        {/* Center (Timer) */}
                                        <div className="self-start sm:self-auto flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                            <span className="text-slate-400 text-sm">⏱</span>
                                            <span className="font-mono text-base sm:text-lg font-medium text-slate-700 tracking-tight">
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>

                                        {/* Right */}
                                        
                                    </div>
                                </header>

                                {/* Sidebar */}
                                <div className="flex flex-col md:flex-row min-h-screen">

                                    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r p-4 sm:p-6 flex flex-col">

                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
                                                Questions
                                            </h3>

                                            <div className="grid grid-cols-4 gap-2">
                                                {questions.map((q, i) => {
                                                    const isActive = i === currentIndex;
                                                    const isAnswered = answers[q.id] !== undefined;
                                                    const isFlagged = flagged.has(q.id);

                                                    let cls =
                                                        "aspect-square flex items-center justify-center text-xs font-bold rounded cursor-pointer border";

                                                    if (isActive)
                                                        cls += " border-blue-500 text-blue-600 ring-4 ring-blue-100";
                                                    else if (isFlagged)
                                                        cls += " bg-amber-50 text-amber-600 border-amber-200";
                                                    else if (isAnswered)
                                                        cls += " bg-slate-900 text-white";
                                                    else cls += " bg-slate-50 text-slate-400";

                                                    return (
                                                        <div
                                                            key={q.id}
                                                            onClick={() => setCurrentIndex(i)}
                                                            className={cls}
                                                        >
                                                            {String(i + 1).padStart(2, "0")}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ===== Legend (Bottom) ===== */}
                                        <div className="mt-auto pt-6">
                                            <div className="flex items-center gap-3 mb-3 text-[11px] text-slate-500">
                                                <div className="size-2 rounded-full bg-apple-blue "></div>
                                                <span>Answered</span>
                                            </div>

                                            <div className="flex items-center gap-3 mb-3 text-[11px] text-slate-500">
                                                <div className="size-2 rounded-full bg-slate-200"></div>
                                                <span>Unanswered</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                                <div className="size-2 rounded-full bg-amber-400"></div>
                                                <span>Flagged</span>
                                            </div>
                                        </div>
                                    </aside>

                                    {/* Main Area */}
                                    <main className="flex-1 p-4 sm:p-6 md:p-10">
                                        <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto space-y-6 sm:space-y-8 bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 md:p-8">
                                            {/* Question Header */}
                                            <div>
                                                <div className="inline-block px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 rounded uppercase tracking-widest mb-3">
                                                    Section: {title}
                                                </div>

                                                <h2 className="text-xl font-medium leading-relaxed text-slate-900">
                                                    {current.question}
                                                </h2>
                                            </div>

                                            {/* Options */}
                                            <div className="space-y-2">
                                                {current?.options?.map((opt, i) => {
                                                    const selected = answers[current.id] === i;
                                                    return (
                                                        <label
                                                            key={i}
                                                            className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${selected
                                                                ? "bg-sky-50 border-sky-300 ring-1 ring-sky-200"
                                                                : "border-slate-100 hover:border-slate-200"
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                checked={selected}
                                                                onChange={() => selectOption(i)}
                                                                className="size-4 text-sky-600 cursor-pointer"
                                                            />
                                                            <span
                                                                className={`ml-4 text-sm ${selected ? "text-slate-900 font-medium" : "text-slate-600"
                                                                    }`}
                                                            >
                                                                {opt}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Controls */}
                                            <div className="flex justify-between items-center pt-6 border-t">
                                                <button
                                                    disabled={currentIndex === 0}
                                                    onClick={() => setCurrentIndex((i) => i - 1)}
                                                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-900 disabled:opacity-40"
                                                >
                                                    <ArrowLeftCircle size={18} />
                                                    <span>Previous</span>
                                                </button>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={toggleFlag}
                                                        className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-amber-600"
                                                    >
                                                        {flagged.has(current.id) ? (
                                                            <>
                                                                <FlagOff size={16} />
                                                                <span>Unflag</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Flag size={16} />
                                                                <span>Flag</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {
                                                        currentIndex === questions.length - 1 ? (

                                                            // ✅ Submit Button (last question)
                                                            <button
                                                                onClick={submitExam}
                                                                className="cursor-pointer px-4 sm:px-5 py-2 text-xs font-semibold bg-apple-blue hover:bg-[#0071e3] text-white rounded-md transition-all shadow-sm"
                                                            >
                                                                Submit Exam
                                                            </button>

                                                        ) : (

                                                            <button
                                                                onClick={() => setCurrentIndex((i) => i + 1)}
                                                                className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-lg text-sm"
                                                            >
                                                                <ArrowRightCircle size={18} />
                                                                <span>Next</span>
                                                            </button>

                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-16 text-center">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                                                Secure Assessment Environment • ID: CP-892-0X
                                            </p>
                                        </div>
                                    </main>
                                </div>
                            </div>
                        )}

                    </>
            }
        </>

    );
}