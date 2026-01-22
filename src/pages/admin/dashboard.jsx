import { useState } from "react";

const Dashboard = () => {
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: "React Basics Test",
      active: true,
      submissions: [
        { name: "Rahul", score: 42 },
        { name: "Amit", score: 36 },
      ],
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      active: false,
      submissions: [
        { name: "Neha", score: 48 },
        { name: "Pooja", score: 40 },
      ],
    },
  ]);

  const [selectedPaper, setSelectedPaper] = useState(null);

  const togglePaper = (id) => {
    setPapers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-navy">Admin Dashboard</h1>

      {/* Papers List */}
      <div className="grid gap-6">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-slate-800">
                {paper.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Submissions: {paper.submissions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedPaper(paper)}
                className="text-sky-600 cursor-pointer text-sm font-medium hover:underline"
              >
                View Results
              </button>

              <button
                onClick={() => togglePaper(paper.id)}
                className={`px-4 cursor-pointer py-2 rounded-md text-sm font-medium transition ${
                  paper.active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {paper.active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Results Panel */}
      {selectedPaper && (
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy">
              Results – {selectedPaper.title}
            </h2>
            <button
              onClick={() => setSelectedPaper(null)}
              className="text-sm cursor-pointer text-slate-500 hover:text-red-500"
            >
              Close
            </button>
          </div>

          {selectedPaper.submissions.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No students have submitted this paper yet.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {selectedPaper.submissions.map((s, i) => (
                  <tr key={i} className="border-b last:border-none">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2 font-medium">{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
