import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../components/Home/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import AllIssues from "../pages/AllIssues";
import Profile from "../components/Profile";
import PrivateRoute from "../components/PrivateRoute";
import IssueDetails from "../pages/IssueDetails";
import DashboardLayout from "../layouts/DashboardLayout";

import ProfileDashboard from "../pages/dashboard/ProfileDashboard";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/dashboard/Dashboard";
import ReportIssue from "../pages/dashboard/ReportIssue";
import MyIssues from "../pages/dashboard/MyIssues";

import AssignedIssues from "../pages/dashboard/AssignedIssues";
import ManageIssues from "../pages/dashboard/ManageIssues";
import ManageUsers from "../pages/dashboard/ManageUsers";
import ManageStaff from "../pages/dashboard/ManageStaff";
import Payments from "../pages/dashboard/Payments";
import HowItWorksPage from "../pages/HowItWorksPage";
import CommunityPage from "../pages/CommunityPage";

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
        path: "/how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "/community",
        element: <CommunityPage />,
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
            <IssueDetails />
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
          {
            path: "my-issues",
            element: (
              <PrivateRoute allowedRoles={["citizen", "staff", "admin"]}>
                <MyIssues />
              </PrivateRoute>
            ),
          },
          { path: "profile-dashboard", element: <ProfileDashboard /> },
          {
            path: "report-issue",
            element: (
              <PrivateRoute allowedRoles={["citizen", "staff", "admin"]}>
                <ReportIssue />
              </PrivateRoute>
            ),
          },
          {
            path: "assigned-issues",
            element: (
              <PrivateRoute allowedRoles={["staff"]}>
                <AssignedIssues />
              </PrivateRoute>
            ),
          },
          {
            path: "manage-issues",
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageIssues />
              </PrivateRoute>
            ),
          },
          {
            path: "manage-users",
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </PrivateRoute>
            ),
          },
          {
            path: "manage-staff",
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageStaff />
              </PrivateRoute>
            ),
          },
          {
            path: "payments",
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <Payments />
              </PrivateRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
