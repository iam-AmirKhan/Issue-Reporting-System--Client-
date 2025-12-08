import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../components/Home/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import AllIssues from "../pages/AllIssues";
import Profile from "../components/Profile";
import PrivateRoute from "../components/PrivateRoute";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index:true,
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
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    
    ],
  },
]);

export default router;
