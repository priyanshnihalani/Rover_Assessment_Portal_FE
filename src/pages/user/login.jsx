import { useState } from "react";
import HexLoader from "../../components/loader";
import { useNavigate } from "react-router-dom";

const StudentExamLogin = () => {
    const [form, setForm] = useState({
        name:"",
        email: "",
        code: "",
        terms: false,
    });
    const navigate = useNavigate()
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name) {
            newErrors.name = "Username is required"; 
        } 
        if (!form.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!form.code) {
            newErrors.code = "Exam code is required";
        }

        if (!form.terms) {
            newErrors.terms = "You must confirm readiness";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (form.email == "admin@techrover.us" && form.code == "techrover@2025") {
            navigate("/admin/exambuilder", { replace: true, state: {admin: "iamadmin"} })
        }
        else {
            navigate("/exam", { state: { form }, replace: true })
        }
    };

    return (

        <>
            {loading ? <HexLoader /> : <div className="bg-apple-bg text-apple-dark min-h-screen flex flex-col">
                {/* Header */}
                <header className="w-full py-8 px-6 md:px-12 flex justify-between items-center bg-apple-bg/80 backdrop-blur-md sticky top-0 z-10">
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

                </header>

                {/* Main */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="max-w-[1000px] w-full flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-24">
                        {/* Left */}
                        <div className="w-full max-w-[420px] order-2 lg:order-1">
                            <div className="mb-10 text-center lg:text-left">
                                <h1 className="text-[40px] font-bold tracking-tight text-apple-dark leading-tight mb-3">
                                    Sign in to begin.
                                </h1>
                                <p className="text-lg text-apple-gray font-normal">
                                    Enter your details to start the exam session.
                                </p>
                            </div>

                            <div className="bg-white p-8 md:p-10 rounded-apple-lg shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-apple-dark uppercase tracking-wider ml-1">
                                            UserName
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className={`apple-input ${errors.name ? "border-red-400" : ""
                                                }`}
                                            placeholder="01-name"
                                            type="text"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500 ml-1">{errors.name}</p>
                                        )}
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-apple-dark uppercase tracking-wider ml-1">
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className={`apple-input ${errors.email ? "border-red-400" : ""
                                                }`}
                                            placeholder="name@university.edu"
                                            type="email"
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500 ml-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Code */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-apple-dark uppercase tracking-wider ml-1">
                                            Exam Code
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="code"
                                                value={form.code}
                                                onChange={handleChange}
                                                className={`apple-input ${errors.code ? "border-red-400" : ""
                                                    }`}
                                                placeholder="Enter code"
                                                type="text"
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-apple-gray/50">
                                                key
                                            </span>
                                        </div>
                                        {errors.code && (
                                            <p className="text-xs text-red-500 ml-1">{errors.code}</p>
                                        )}
                                    </div>

                                    {/* Terms */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={form.terms}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded-md border-[#d2d2d7] text-apple-blue focus:ring-apple-blue/20"
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="text-sm text-apple-gray leading-tight cursor-pointer select-none"
                                        >
                                            I am in a quiet environment and ready.
                                        </label>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-xs text-red-500 ml-1">{errors.terms}</p>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-apple-blue hover:bg-[#0071e3] text-white font-semibold h-12 rounded-apple transition-all active:scale-[0.98] shadow-lg shadow-apple-blue/20 mt-4"
                                    >
                                        Start Exam
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex-1 w-full max-w-[480px] order-1 lg:order-2">
                            <div className="lg:pt-4">
                                <h2 className="text-xs font-bold text-apple-blue uppercase tracking-[0.2em] mb-8">
                                    Exam Guidelines
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                                    {[
                                        ["timer", "Time", "The timer starts as soon as you click 'Start Exam'."],
                                        ["safety_divider", "Anti-Cheat", "Browser window monitoring and randomization active."],
                                        ["quiz", "Questions", "Multiple choice format. All questions are mandatory."],
                                        ["do_not_disturb_on", "Single Attempt", "Timeout will automatically submit your results."],
                                    ].map(([icon, title, desc]) => (
                                        <div key={title} className="space-y-3">
                                            <span className="material-symbols-outlined text-apple-blue text-3xl">
                                                {icon}
                                            </span>
                                            <h3 className="text-base font-semibold text-apple-dark leading-none">
                                                {title}
                                            </h3>
                                            <p className="text-sm text-apple-gray leading-relaxed">
                                                {desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 p-6 rounded-apple bg-white/40 border border-[#d2d2d7]/30">
                                    <p className="text-sm italic text-apple-gray leading-relaxed">
                                        "Your preparation today is the foundation of your success tomorrow. Please ensure you have a stable internet connection."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-[#d2d2d7]/30 text-center">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <p className="text-[11px] font-semibold text-apple-gray tracking-widest uppercase">
                            Rover Assessment Portal
                        </p>
                        <p className="text-xs text-apple-gray/60 max-w-lg mx-auto leading-relaxed">
                            Copyright © {new Date().getFullYear()} Secure Assessment Services. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>}
        </>
    );
};

export default StudentExamLogin;
