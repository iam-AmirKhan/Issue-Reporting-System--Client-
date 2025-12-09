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
import Overview from "../pages/dashboard/Overview";
import MyIssues from "../pages/dashboard/MyIssue";
import Payments from "../pages/dashboard/Payments";
import ProfileDashboard from "../pages/dashboard/ProfileDashboard";
import NotFound from "../pages/NotFound";

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
        element: <AllIssues  />,
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
        path: "/issues/:id",
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
          { index: true, element: <Overview /> },
          { path: "my-issues", element: <MyIssues /> },
          { path: "payments", element: <Payments /> },
          { path: "profile", element: <ProfileDashboard /> },
        ],
      },
    ],
  },
]);

export default router;
