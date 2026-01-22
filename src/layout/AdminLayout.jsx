import { NavLink, Outlet, useLocation } from "react-router-dom"

const AdminLayout = () => {
    const location = useLocation();
    const isExamBuilder = location.pathname === "/admin/exambuilder";

    return (
        <>
        
            <Outlet />
        </>
    )
}

export default AdminLayout