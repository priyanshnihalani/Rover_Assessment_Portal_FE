import { useEffect, useRef, useState } from "react";
import { ApiService } from "../../services/ApiService"
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import HexLoader from "../../components/loader";
import { Trash } from 'lucide-react';

const ExamBuilder = () => {
    const [title, setTitle] = useState("");
    const [timeLimit, setTimeLimit] = useState(45);
    const [questionsToShow, setQuestionsToShow] = useState(10);
    const [selectedPaperId, setSelectedPaperId] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation()
    const navigate = useNavigate()
    const clickTimer = useRef(null);

    if (!location.state || location.state?.admin != "iamadmin") {
        navigate("/", { replace: true })
    }

    const loadPaperIntoEditor = (paper = {}) => {
        setSelectedPaperId(paper.id || null);
        setTitle(paper.title || "");
        setTimeLimit(paper.timeLimit || 45);
        setQuestionsToShow(paper.questionsToShow || 10);

        const questions = paper.Questions || [];

        if (questions.length === 0) {
            setQuestions([
                {
                    id: "",
                    text: "",
                    points: 5,
                    options: ["", "", "", ""],
                    correct: 0,
                },
            ]);
            return;
        }

        const mappedQuestions = questions.map((q) => ({
            id: q.id,
            text: q.prompt,
            points: q.points,
            options: q.Options
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((o) => o.text),
            correct: ["A", "B", "C", "D"].indexOf(q.correctOption),
        }));

        setQuestions(mappedQuestions);
    };



    const loadPapers = async () => {
        try {
            setLoading(true);

            const res = await ApiService.get(`/api/paper/getAllPapers`);
            const papers = res.papers || [];

            setRecentPapers(papers);

            const activePaper = papers.find((p) => p.status === "ACTIVE");

            if (activePaper) {
                loadPaperIntoEditor(activePaper);
            } else {
                createNewPaper();
            }
        } catch (err) {
            console.error("Failed to load papers", err);
            createNewPaper();
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        loadPapers()
    }, [])

    const [questions, setQuestions] = useState([
        {
            id: '',
            text: "",
            points: 5,
            options: ["", "", "", ""],
            correct: 0,
        },
    ]);

    const [recentPapers, setRecentPapers] = useState([]);


    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: "",
                text: "",
                points: 5,
                options: ["", "", "", ""],
                correct: 0,
            },
        ]);
    };

    const createNewPaper = () => {
        setSelectedPaperId(null);
        setTitle("");
        setTimeLimit(45);
        setQuestionsToShow(10);
        setQuestions([
            {
                id: "",
                text: "",
                points: 5,
                options: ["", "", "", ""],
                correct: 0,
            },
        ]);
    };

    const updateQuestionText = (index, value) => {
        const copy = [...questions];
        copy[index].text = value;
        setQuestions(copy);
    };

    const updateOption = (qIndex, optIndex, value) => {
        const copy = [...questions];
        copy[qIndex].options[optIndex] = value;
        setQuestions(copy);
    };

    const setCorrect = (qIndex, optIndex) => {
        const copy = [...questions];
        copy[qIndex].correct = optIndex;
        setQuestions(copy);
    };

    const activatePaper = async (paper) => {
        try {
            setLoading(true);

            if (paper.status === "ACTIVE") {
                await ApiService.put(`/api/paper/deactive/${paper.id}`);

                setRecentPapers((prev) =>
                    prev.map((p) =>
                        p.id === paper.id ? { ...p, status: "DRAFT" } : p
                    )
                );

                await loadPapers();
            } else {
                await ApiService.put(`/api/paper/active/${paper.id}`);

                setRecentPapers((prev) =>
                    prev.map((p) => ({
                        ...p,
                        status: p.id === paper.id ? "ACTIVE" : "DRAFT",
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to toggle paper", err);
            alert("Failed to change paper status");
        } finally {
            setLoading(false);
        }
    };



    const saveExam = async () => {
        if (questionsToShow > questions.length) {
            alert(
                `Questions to show (${questionsToShow}) cannot be more than total questions (${questions.length})`
            );
            return;
        }

        const payload = {
            title,
            timeLimit,
            questionsToShow,
            questions: questions.map((q) => ({
                prompt: q.text,
                points: q.points,
                correctOption: ["A", "B", "C", "D"][q.correct],
                options: q.options.map((opt, i) => ({
                    label: ["A", "B", "C", "D"][i],
                    text: opt,
                })),
            })),
        };

        try {
            setLoading(true);

            if (selectedPaperId) {
                await ApiService.put(
                    `/api/paper/update/${selectedPaperId}`,
                    payload
                );
            } else {
                await ApiService.post("/api/paper/create", payload);
            }

            await loadPapers();
        } catch (err) {
            console.error("Failed to save exam", err);
            alert("Failed to save exam");
        } finally {
            setLoading(false);
        }
    };


    const deleteQuestion = async (id) => {
        try {
            const result = await ApiService.post(`/api/paper/deleteQuestion/${id}`)
            console.log(result)
            await loadPapers();
        }
        catch (err) {
            console.log(err)
        }
    }

    const deletePaper = async (event, id) => {
        event.stopPropagation()
        try {
            const result = await ApiService.post(`/api/paper/deletePaper/${id}`)
            console.log(result)
            await loadPapers();
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <>

            {loading ? <HexLoader /> : <div className="text-slate-800 min-h-screen flex flex-col bg-off-white font-inter">
                {/* Header */}
                <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
                    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white px-8 py-4">
                        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
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
                                <span className="text-sm font-semibold tracking-tight uppercase">
                                    Rover Assessment Portal
                                </span>
                            </div>

                            <div className="flex items-center gap-8">
                                {/* Navigation */}
                                <nav className="hidden md:flex items-center gap-8">


                                </nav>

                                <div className="flex gap-4">
                                    <button onClick={saveExam} className="bg-blue-400 hover:bg-blue-500 transition cursor-pointer text-white px-5 py-2 rounded-md text-sm font-medium">
                                        Save Exam
                                    </button>
                                </div>

                                <div className="size-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                    <img
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjoGxMYRgB84lHs8y-YDrdkzv8qf2cXOVUWVpQgaBNfXu35pc7dH3Q3kwnMIK0joU1sSkVK_DXiglMs4IG6kuP_vypkkrBmonnuQb0bHvuDwhVUw8Kz7CYPT7pD0dRwgfgA6ElKP5uzbvUOb7Q-9-lCKOo_Y7uvCH_WiqoSwYk3ngJixHBF1BMNMYKzHuQgP5NqVBqBYlQaRaclCD3qJZl1LyGiCqXeA3pHJBb_6NZGgXHYO0kjV9eG5-A0e7jF91R5YVXSzrXXgtL"
                                    />
                                </div>
                            </div>
                        </div>
                    </header>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="hidden md:flex w-72 lg:w-80 border-r border-slate-200 bg-white flex-col shrink-0 overflow-y-auto custom-scrollbar">
                        <div className="p-8 flex flex-col gap-8">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                                    Exam Configuration
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Exam Title
                                        </label>
                                        <input
                                            className="pl-2 focus:outline-none focus:border focus:border-blue-600 focus:ring-2 focus:ring-blue-400 w-full border-slate-200 rounded-md text-sm py-2.5"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter exam title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Time Limit (Minutes)
                                        </label>
                                        <input
                                            className="pl-2 focus:outline-none focus:border focus:border-blue-600 focus:ring-2 focus:ring-blue-400 w-full border-slate-200 rounded-md text-sm py-2.5"
                                            type="number"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Questions To Show
                                        </label>
                                        <input
                                            className="pl-2 focus:outline-none focus:border focus:border-blue-600 focus:ring-2 focus:ring-blue-400 w-full border-slate-200 rounded-md text-sm py-2.5"
                                            type="number"
                                            value={questionsToShow}
                                            onChange={(e) =>
                                                setQuestionsToShow(Number(e.target.value))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:hidden p-6 flex flex-col gap-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Recent Papers
                            </h2>

                            <div className="space-y-4">
                                {recentPapers.map((paper) => {
                                    const isActive = paper.status === "ACTIVE";

                                    return (
                                        <div
                                            key={paper.id}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                clearTimeout(clickTimer.current);

                                                clickTimer.current = setTimeout(() => {
                                                    activatePaper(paper);
                                                    loadPaperIntoEditor(paper);
                                                }, 200);
                                            }}

                                            // onDoubleClick={() => {
                                            //     clearTimeout(clickTimer.current);
                                            //     navigate(`/admin/studentexaminfo/${paper.id}`);
                                            // }}

                                            className={`
                        relative p-4 rounded-xl border cursor-pointer transition
                        ${isActive
                                                    ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                                                    : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                                                }
                    `}
                                        >
                                            {isActive && (
                                                <span className="absolute top-2 right-2 text-[10px] px-2 py-[2px] rounded-full bg-blue-600 text-white font-semibold tracking-wide">
                                                    ACTIVE
                                                </span>
                                            )}

                                            <h3 className="text-sm font-semibold text-slate-800">
                                                {paper.title || "Untitled Paper"}
                                            </h3>

                                            <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                                                <p>{paper.code}</p>
                                                <p>
                                                    {paper.questionsToShow} / {paper.Questions?.length || 0} Questions
                                                </p>
                                                <p>{paper.timeLimit} Minutes</p>
                                                <p className="text-slate-400">
                                                    Updated {new Date(paper.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </aside>


                    {/* Main */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 lg:p-12">
                        <div className="max-w-full sm:max-w-3xl lg:max-w-4xl mx-auto space-y-6 sm:space-y-8">
                            <h2 className="text-2xl font-semibold text-navy">
                                Create New Exam Paper
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Design your questionnaire and configure anti-cheating measures.
                            </p>

                            {questions.map((q, qi) => (
                                <div
                                    key={qi}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                                >
                                    {/* {console.log(q.id)} */}
                                    <div className="p-8">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <span className="size-8 rounded-md bg-navy  flex items-center justify-center text-sm font-bold">
                                                    {String(qi + 1).padStart(2, "0")}
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                                    Multiple Choice Question
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-100 bg-slate-50">
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                        Points
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={q.points}
                                                        onChange={(e) => {
                                                            const copy = [...questions];
                                                            copy[qi].points = e.target.value >= 0 && +e.target.value;
                                                            setQuestions(copy);
                                                            console.log(questions)
                                                        }}
                                                        className="focus:outline-none w-8 bg-transparent border-none p-0 text-sm font-bold text-center focus:ring-0"
                                                    />
                                                </div>
                                                <Trash className="text-red-500 size-5" onClick={() => deleteQuestion(q.id)} />
                                            </div>
                                        </div>

                                        {/* Question */}
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-3">
                                                    Question Prompt
                                                </label>
                                                <textarea
                                                    value={q.text}
                                                    onChange={(e) =>
                                                        updateQuestionText(qi, e.target.value)
                                                    }
                                                    className="
    w-full
    border border-slate-200
    rounded-md
    text-sm
    p-4
    min-h-[100px]
    resize-none
    outline-none

    focus:border-sky-400
    focus:ring-3
    focus:ring-blue-400/60

    transition
    duration-200
    "

                                                    placeholder="Enter the main question text here..."
                                                />
                                            </div>

                                            {/* Options */}
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                                    Options & Correct Answer
                                                </p>

                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-4">
                                                        <input
                                                            type="radio"
                                                            checked={q.correct === oi}
                                                            onChange={() => setCorrect(qi, oi)}
                                                            name={`q-${qi}`}
                                                            className="size-5 text-primary"
                                                        />

                                                        <div className="flex-1 flex items-center border border-slate-200 rounded-md px-4 py-3 bg-slate-50/30">
                                                            <span className="text-xs font-bold text-slate-400 w-6">
                                                                {String.fromCharCode(65 + oi)}
                                                            </span>
                                                            <input
                                                                value={opt}
                                                                onChange={(e) =>
                                                                    updateOption(qi, oi, e.target.value)
                                                                }
                                                                className="focus:outline-none w-full bg-transparent border-none text-sm"
                                                                placeholder="Add option text..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Question */}
                            <button
                                onClick={addQuestion}
                                className="w-full cursor-pointer py-6 rounded-xl border-2 border-dashed border-blue-400 flex flex-col items-center gap-2 hover:border-primary hover:bg-white transition-all group"
                            >
                                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary">
                                    add_circle
                                </span>
                                <span className="text-sm font-semibold text-slate-400 group-hover:text-primary">
                                    Add Another Question
                                </span>
                            </button>
                        </div>
                    </main>

                    <aside className="hidden lg:block w-64 lg:w-72 border-l border-slate-200 bg-white shrink-0 overflow-y-auto custom-scrollbar">
                        <div className="p-6 flex flex-col gap-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Recent Papers
                            </h2>

                            <div className="space-y-4">
                                {recentPapers.map((paper) => {
                                    const isActive = paper.status === "ACTIVE";

                                    return (
                                        <div
                                            key={paper.id}
                                            onClick={(e) => {
                                                if (e.target.closest(".delete-btn")) return;

                                                clearTimeout(clickTimer.current);

                                                clickTimer.current = setTimeout(() => {
                                                    activatePaper(paper);
                                                    loadPaperIntoEditor(paper);
                                                }, 200);
                                            }}
                                            onDoubleClick={() => {
                                                clearTimeout(clickTimer);
                                                navigate(`/admin/studentexaminfo/${paper.id}`);
                                            }}
                                            className={`
                        relative p-4 rounded-xl border cursor-pointer transition
                        ${isActive
                                                    ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                                                    : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                                                }
                    `}
                                        >  <div className={`flex items-center justify-between relative`}>

    {/* ACTIVE badge */}
    {isActive && (
        <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-600 text-white font-semibold tracking-wide">
            ACTIVE
        </span>
    )}

        <button
            className="
                bg-red-500
                text-white
                text-xs
                px-2 py-[2px]
                rounded-full
                transition
                cursor-pointer
            "
            onClick={(event) => deletePaper(event, paper.id)}
        >
          Delete
        </button>
                <button
            className="
                bg-red-500
                text-white
                text-xs
                cursor-pointer
                px-2 py-[2px]
                rounded-full
                transition
            "
            onClick={() => navigate(`/admin/studentexaminfo/${paper.id}`)}
        >
          View Results
        </button>

</div>


                                            <h3 className="text-sm font-semibold text-slate-800 my-2">
                                                {paper.title || "Untitled Paper"}
                                            </h3>

                                            <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                                                <p>{paper.code}</p>
                                                <p>
                                                    {paper.questionsToShow} / {paper.Questions?.length || 0} Questions
                                                </p>
                                                <p>{paper.timeLimit} Minutes</p>
                                                <p className="text-slate-400">
                                                    Updated {new Date(paper.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </aside>
                </div>
            </div >}
        </>
    );
};

export default ExamBuilder;