import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../components/Home/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import AllIssues from "../pages/AllIssues";
import Profile from "../components/Profile";
import PrivateRoute from "../components/PrivateRoute";
import IssueDetails from "../pages/IssueDetails";
import DashboardLayout from "../layouts/DashBoardLayout";

import ProfileDashboard from "../pages/dashboard/ProfileDashboard";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/dashboard/Dashboard";
import EditIssueModal from "../pages/dashboard/EditIssueModal";
import ReportIssue from "../pages/dashboard/ReportIssue";
import MyIssues from "../pages/dashboard/MyIssues";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/all-issues",
        element: <AllIssues />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/issue/:id",
        element: (
          <PrivateRoute>
            <IssueDetails />,
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute allowedRoles={["citizen", "staff", "admin"]}>
            <DashboardLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "my-issues", element: <MyIssues /> },
          { path: "edit-issue-modal", element: <EditIssueModal /> },
          { path: "profile-dashboard", element: <ProfileDashboard /> },
          { path: "report-issue", element: <ReportIssue /> },
        ],
      },
    ],
  },
]);

export default router;
