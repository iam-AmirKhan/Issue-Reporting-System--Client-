import { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);

  const dropdownRef = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = () => {
    logOut();
  };

  const navItems = (
    <>
      <li><NavLink to="/">Home</NavLink></li>
      <li><NavLink to="/all-issues">All Issues</NavLink></li>
      <li><NavLink to="/report-issue">Report Issue</NavLink></li>
      {user && <li><NavLink to="/dashboard">Dashboard</NavLink></li>}
      {user && <li><NavLink to="/profile">Profile</NavLink></li>}
    </>
  );

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-2">

        <Link to="/" className="text-xl font-bold">
          Public Issue System
        </Link>

        <ul className="hidden md:flex space-x-6">{navItems}</ul>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpen(!open)}>
                  <img
                    src={user.photoURL}
                    alt="user"
                    className="w-10 h-10 rounded-full border cursor-pointer"
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md z-20">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold">{user.displayName || "User Name"}</p>
                    </div>

                    <ul className="py-2">
                      <li>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>

                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-600 px-4 py-1 rounded">
                Login
              </Link>
              <Link to="/register" className="bg-gray-200 text-blue-600 px-4 py-1 rounded">
                Register
              </Link>
            </>
          )}
        </div>

      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-blue-700 p-3">
        <ul className="space-y-2">{navItems}</ul>
      </div>
    </div>
  );
};

export default Navbar;
