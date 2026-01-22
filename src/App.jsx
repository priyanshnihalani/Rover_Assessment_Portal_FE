import { RouterProvider, createBrowserRouter } from "react-router-dom";

import StudentExamLogin from "./pages/user/login";
import ExamUI from "./pages/user/examui";
import ExamBuilder from "./pages/admin/exambuilder";
import AdminLayout from "./layout/AdminLayout";
import StudentExamInfo from "./pages/admin/studentexaminfo";

function App() {
  const router = createBrowserRouter([
    /* ---------- PUBLIC ---------- */
    {
      path: "/",
      element: <StudentExamLogin />,
    },

    /* ---------- EXAM FLOW ---------- */
    {
      path: "/exam",
      element: <ExamUI />,
    },

    /* ---------- ADMIN ---------- */
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "exambuilder",
          element: <ExamBuilder />,
        },
        {
          path: "studentexaminfo/:id",
          element: <StudentExamInfo />
        }
      ],
    },

    /* ---------- FALLBACK ---------- */
    {
      path: "*",
      element: <h1 className="p-10 text-xl">404 - Page Not Found</h1>,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
