import { Link } from 'react-router-dom';

const ApiDocsSidebar = ({ activeSection, onNavigate, isMobileOpen, onClose }) => {
  const sections = [
    {
      title: "Introduction",
      items: [
        { id: "installation", label: "Getting Started" },
        { id: "authentication", label: "Authentication" }
      ]
    },
    {
      title: "Resources",
      items: [
        { id: "users", label: "Transfi Balance" },
        { id: "money-transfer", label: "Money Transfer" }
      ]
    }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={onClose}
      />

      <aside 
        className={`
          fixed lg:sticky top-0 bottom-0 left-0 z-50
          w-72 lg:w-64 bg-white text-secondary-900 border-r border-secondary-200 
          min-h-screen flex flex-col flex-shrink-0 
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-secondary-100">
          <Link to="/" className="text-xl font-black tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            Remit<span className="text-primary-500">.</span>API
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-secondary-500 hover:text-secondary-900 rounded-lg hover:bg-secondary-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-8 px-6">
              <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-4 px-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeSection === item.id
                          ? "bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20"
                          : "text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-secondary-100">
          <div className="bg-secondary-50 rounded-xl p-4">
            <p className="text-xs text-secondary-500 mb-1">API Version</p>
            <p className="font-mono text-sm font-bold text-primary-600">v1.0.2</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ApiDocsSidebar;
