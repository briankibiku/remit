import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DocsSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => {
    const base =
      "flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200";
    return isActive(path)
      ? `${base} bg-blue-500 text-white shadow-md`
      : `${base} text-gray-700 hover:bg-gray-100`;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Toggle menu"
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
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-white shadow-lg flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          w-64
        `}
      >
        {/* Header with Toggle Button */}
        <div className="p-4 border-b flex items-center justify-between">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
            }`}
          >
            <h2 className="font-bold text-xl text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">{user?.email}</p>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
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

          {/* Mobile Close Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/docs"
            className={linkClass("/dashboard")}
            onClick={() => setIsMobileOpen(false)}
          >
            <span
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
              }`}
            >
              How to install
            </span>
          </Link>
          <Link
            to="/docs"
            className={linkClass("/wallet")}
            onClick={() => setIsMobileOpen(false)}
          >
            <span
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
              }`}
            >
              How to add users
            </span>
          </Link>{" "}
          <Link
            to="/docs"
            className={linkClass("/users")}
            onClick={() => setIsMobileOpen(false)}
          >
            <span
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
              }`}
            >
              Send money using TransFi APIs
            </span>
          </Link>
          <div className="relative">
            <button
              onClick={() => !isCollapsed && setSettingsOpen(!settingsOpen)}
              onMouseEnter={() => isCollapsed && setSettingsOpen(true)}
              onMouseLeave={() => isCollapsed && setSettingsOpen(false)}
              className={`
                w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200
                ${
                  isActive("/api-keys") ||
                  location.pathname.startsWith("/settings")
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span
                className={`flex-1 text-left overflow-hidden transition-all duration-300 ${
                  isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
                }`}
              >
                Settings
              </span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                } ${isCollapsed ? "lg:hidden" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Submenu - Shows below when expanded, shows as tooltip when collapsed */}
            <div
              className={`
                transition-all duration-300
                ${
                  isCollapsed
                    ? `lg:absolute lg:left-full lg:top-0 lg:ml-2 lg:bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-gray-200 lg:min-w-[200px] lg:z-50 ${
                        settingsOpen
                          ? "lg:opacity-100 lg:visible"
                          : "lg:opacity-0 lg:invisible"
                      }`
                    : `overflow-hidden ${
                        settingsOpen
                          ? "max-h-40 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }`
                }
              `}
              onMouseEnter={() => isCollapsed && setSettingsOpen(true)}
              onMouseLeave={() => isCollapsed && setSettingsOpen(false)}
            >
              <Link
                to="/api-keys"
                className={`
                  flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-200
                  ${isCollapsed ? "" : "ml-7"}
                  ${
                    isActive("/api-keys")
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
                onClick={() => {
                  setIsMobileOpen(false);
                  setSettingsOpen(false);
                }}
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <span className="text-sm">API Keys</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`
              w-full bg-red-500 text-white py-2 px-4 rounded-lg 
              hover:bg-red-600 transition-all duration-200
              flex items-center justify-center gap-2
              shadow-md hover:shadow-lg
            `}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
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
            <span
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-full opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DocsSidebar;