import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import AddUserModal from "../components/users/AddUserModal";
import { getUsersService } from "../services/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersService();
      
      // Map API response to UI model
      const mappedUsers = (data.user || []).map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName || ''}`.trim(),
        email: u.email,
        status: u.verified ? "Verified" : "Pending",
        role: u.role || "user",
        lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Never',
        initial: u.firstName ? u.firstName.charAt(0) : 'U'
      }));

      setUsers(mappedUsers);
      setError("");
    } catch (err) {
      setError(typeof err === 'string' ? err : "Failed to load users list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (userData) => {
    // In a real app, this would be an API call
    console.log("Adding user:", userData);
    
    // Optimistically update UI
    const newUser = {
      id: Date.now().toString(),
      name: userData.fullName,
      email: userData.email,
      status: "Verified",
      role: "user",
      lastActive: "Just now",
      initial: userData.fullName.charAt(0)
    };

    setUsers([newUser, ...users]);
  };

  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:px-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-6 animate-fade-in text-center md:text-left">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 tracking-tight">
                User Management
              </h1>
              <p className="text-sm md:text-base text-secondary-500 font-medium mt-1">
                Manage permissions and oversee all active accounts.
              </p>
            </div>

            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New User
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-secondary-500 font-medium">Fetching users...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl mb-8 flex items-start gap-4 animate-slide-up">
              <div className="p-2 bg-red-100 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Communication error</h3>
                <p className="mt-1 font-medium">{error}</p>
                <button onClick={fetchUsers} className="mt-3 text-sm font-bold underline hover:translate-x-1 transition-transform inline-block">
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-secondary-100 overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="hidden sm:table-header-group">
                    <tr className="border-b border-secondary-50">
                      <th className="px-8 py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400">User Information</th>
                      <th className="px-8 py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400">Role</th>
                      <th className="px-8 py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400">Status</th>
                      <th className="px-8 py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400">Last Active</th>
                      <th className="px-8 py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {users.map((u) => (
                      <tr key={u.id} className="group hover:bg-secondary-50/50 transition-colors flex flex-col sm:table-row py-4 sm:py-0">
                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                              {u.initial}
                            </div>
                            <div>
                              <p className="font-extrabold text-secondary-900 text-sm sm:text-base">{u.name}</p>
                              <p className="text-secondary-400 text-xs sm:text-sm font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-2 sm:py-6 flex sm:table-cell items-center justify-between">
                          <span className="sm:hidden text-[10px] font-black uppercase text-secondary-400 tracking-widest">Role</span>
                          <span className="text-secondary-600 font-bold text-sm tracking-tight capitalize">{u.role}</span>
                        </td>
                        <td className="px-6 sm:px-8 py-2 sm:py-6 flex sm:table-cell items-center justify-between">
                          <span className="sm:hidden text-[10px] font-black uppercase text-secondary-400 tracking-widest">Status</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            u.status === "Verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 sm:px-8 py-2 sm:py-6 flex sm:table-cell items-center justify-between">
                          <span className="sm:hidden text-[10px] font-black uppercase text-secondary-400 tracking-widest">Last Updated</span>
                          <span className="text-secondary-400 text-xs sm:text-sm font-medium">{u.lastActive}</span>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 sm:p-2.5 bg-white border border-secondary-100 rounded-lg sm:rounded-xl text-secondary-500 hover:text-primary-600 hover:border-primary-100 transition-all active:scale-95 shadow-sm">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-2 sm:p-2.5 bg-white border border-secondary-100 rounded-lg sm:rounded-xl text-secondary-500 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 md:p-8 bg-secondary-50/30 border-t border-secondary-50 flex flex-col items-center justify-between gap-4">
                <p className="text-secondary-400 text-xs md:text-sm font-medium">
                  Showing <span className="text-secondary-900 font-bold">1 to {users.length}</span> of <span className="text-secondary-900 font-bold">{users.length}</span> users
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white border border-secondary-100 rounded-xl text-secondary-400 font-bold text-xs disabled:opacity-50" disabled>Previous</button>
                  <button className="px-4 py-2 bg-white border border-secondary-100 rounded-xl text-secondary-900 font-bold hover:bg-secondary-50 transition-all active:scale-95 text-xs">Next</button>
                </div>
              </div>
            </div>
          )}
          
          <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            onSubmit={handleAddUser}
          />
        </div>
      </main>
    </div>
  );
};

export default Users;
