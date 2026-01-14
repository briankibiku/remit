import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon, label, badge }) => (
    <Link
      to={to}
      className={`
        flex items-center gap-3 py-3 px-4 rounded-2xl transition-all duration-200 group
        ${
          isActive(to)
            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
            : "text-secondary-500 hover:bg-secondary-100/50 hover:text-secondary-900"
        }
      `}
      onClick={() => setIsMobileOpen(false)}
    >
      <div
        className={`transition-transform duration-200 ${
          isActive(to) ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </div>
      <span
        className={`font-bold transition-all duration-300 whitespace-nowrap overflow-hidden ${
          isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100 text-sm"
        }`}
      >
        {label}
      </span>
      {!isCollapsed && badge && (
        <span className="ml-auto bg-primary-100 text-primary-600 text-[10px] py-0.5 px-2 rounded-full font-extrabold uppercase tracking-tighter shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 bg-white text-secondary-900 p-3 rounded-2xl shadow-xl border border-secondary-100 active:scale-90 transition-all"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-secondary-900/40 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          bg-white border-r border-secondary-100 flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-24" : "lg:w-72"}
          ${
            isMobileOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full lg:translate-x-0"
          }
          w-72
        `}
      >
        {/* Logo Section */}
        <div className="p-6 mb-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-secondary-400 hover:bg-secondary-50 hover:text-secondary-900 transition-all active:scale-90"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <NavItem
            to="/dashboard"
            label="Home"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
          />
          <NavItem
            to="/wallet"
            label="Wallet"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
            badge="Soon"
          />
          <NavItem
            to="/users"
            label="Users"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <NavItem
            to="/api-keys"
            label="API Keys"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            }
          />
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-secondary-100 bg-secondary-50/30">
          <div
            className={`p-4 rounded-[1.5rem] bg-white border border-secondary-100 shadow-sm transition-all duration-300 ${
              isCollapsed ? "px-2" : ""
            }`}
          >
            {!isCollapsed && (
              <div className="flex flex-col mb-4">
                <p className="font-bold text-secondary-900 text-sm truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-secondary-400 text-xs truncate font-medium">
                  {user?.email}
                </p>
              </div>
            )}

            <button
              onClick={() => logout()}
              className={`
                 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white 
                 transition-all duration-200 font-bold text-xs active:scale-95
               `}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
