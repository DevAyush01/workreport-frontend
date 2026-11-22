import { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileText, LogOut, Filter, Trash2, Download, Calculator, LayoutDashboard, UserPlus, ExternalLink, Calendar, Menu, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [filters, setFilters] = useState({ user_id: '', date: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'website' });
  const [userRoleFilter, setUserRoleFilter] = useState('');

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const fetchReports = async () => {
    const res = await api.get(`/admin/reports?user_id=${filters.user_id}&date=${filters.date}`);
    setReports(res.data);
  };

  const calculateHours = async () => {
    const res = await api.get(`/admin/total-hours?user_id=${filters.user_id}`);
    setTotalHours(res.data.total_hours);
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { fetchReports(); calculateHours(); }, [filters]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'website' });
      fetchUsers();
      alert("User created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  const deleteUser = async (id) => {
    if(window.confirm("Are you sure? This will delete the user and all their reports.")) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchReports();
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, `Work_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  const renderLinks = (links) => {
    if (!links) return '-';
    const linkArray = links.split(/[,\n]+/).filter(link => link.trim() !== '');
    return linkArray.map((link, index) => {
      let cleanLink = link.trim();
      if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
        cleanLink = 'https://' + cleanLink;
      }
      return (
        <a key={index} href={cleanLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block text-xs truncate max-w-[120px] mb-1" title={cleanLink}>
          {link.trim()}
        </a>
      );
    });
  };

  // Sidebar Component (reusable for desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className="p-6 text-2xl font-bold border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-500" /> WorkAdmin
        </div>
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-gray-300'}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        
        <button 
          onClick={() => { setActiveTab('all-reports'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${activeTab === 'all-reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-gray-300'}`}
        >
          <Calendar size={20} /> All Reports
        </button>

        <button 
          onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-gray-300'}`}
        >
          <Users size={20} /> Manage Users
        </button>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-slate-800 rounded-lg">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <SidebarContent />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2 font-bold text-blue-600">
            <FileText size={20} /> WorkAdmin
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab === 'all-reports' ? 'All Reports' : 'User Management'}
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                {activeTab === 'dashboard' ? 'Manage reports and calculate hours' : activeTab === 'all-reports' ? 'View, filter and export full reports' : 'View, create and delete team members'}
              </p>
            </div>
          </header>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                  <UserPlus className="text-blue-600" size={20} /> Quick Add User
                </h3>
                <form onSubmit={createUser} className="space-y-4">
                  <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm" required />
                  <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full border p-3 rounded-xl text-sm" required />
                  <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-3 rounded-xl text-sm" required />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full border p-3 rounded-xl bg-white text-sm">
                    <option value="website">Website Team</option>
                    <option value="youtube">YouTube Team</option>
                    <option value="twitter">Twitter Team</option>
                    <option value="facebook">Facebook Team</option>
                    <option value="it">IT Department</option>
                  </select>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md">Create User</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Calculator className="text-purple-600"/> Total Hours</h3>
                    <p className="text-sm text-gray-500">For selected user</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{totalHours} hrs</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <FileText className="text-blue-600" size={20} /> Recent Reports
                    </h3>
                    <button onClick={() => setActiveTab('all-reports')} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                      Full View <ExternalLink size={14}/>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Work</th><th className="p-3">Hours</th></tr>
                      </thead>
                      <tbody>
                        {reports.slice(0, 5).map(r => (
                          <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                            <td className="p-3"><span className="font-medium text-gray-900">{r.user_name}</span></td>
                            <td className="p-3 truncate max-w-[150px]" title={r.work_description}>{r.work_description}</td>
                            <td className="p-3 font-semibold">{r.hours_spent || '-'}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALL REPORTS TAB */}
          {activeTab === 'all-reports' && (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Calendar className="text-blue-600" size={20} /> Report History
                </h3>
                <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded-xl border w-full md:w-auto">
                  <select value={filters.user_id} onChange={e => setFilters({...filters, user_id: e.target.value})} className="border p-2 rounded-lg text-sm outline-none bg-white flex-1 md:flex-none">
                    <option value="">All Users</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} className="border p-2 rounded-lg text-sm outline-none flex-1 md:flex-none" />
                  <button onClick={() => setFilters({user_id: '', date: ''})} className="text-gray-500 hover:text-blue-600 p-2" title="Reset Filters"><Filter size={18}/></button>
                  <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition w-full md:w-auto justify-center">
                    <Download size={16} /> Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b">
                    <tr>
                      <th className="p-3 md:p-4">Date</th>
                      <th className="p-3 md:p-4">User</th>
                      <th className="p-3 md:p-4">Time</th>
                      <th className="p-3 md:p-4">Work</th>
                      <th className="p-3 md:p-4">Hours</th>
                      <th className="p-3 md:p-4">Links</th>
                      <th className="p-3 md:p-4">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-gray-500">No reports found.</td></tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 md:p-4 whitespace-nowrap font-medium text-gray-900">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="p-3 md:p-4"><span className="font-medium text-gray-900">{r.user_name}</span><br/><span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{r.role}</span></td>
                          <td className="p-3 md:p-4 text-xs text-gray-600 whitespace-nowrap">{r.in_time} <br/> {r.out_time}</td>
                          <td className="p-3 md:p-4 text-gray-700 max-w-[150px] truncate" title={r.work_description}>{r.work_description}</td>
                          <td className="p-3 md:p-4 font-semibold">{r.hours_spent || '-'}h</td>
                          <td className="p-3 md:p-4">{renderLinks(r.links)}</td>
                          <td className="p-3 md:p-4 text-red-500 text-xs max-w-[120px]" title={`Reason: ${r.pending_reason || 'N/A'}`}>
                            {r.pending_work || '-'}
                            {r.pending_reason && <span className="block text-gray-400 mt-1">({r.pending_reason})</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MANAGE USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Users className="text-blue-600" size={20} /> Team Members ({users.length})
                </h3>
                <select 
                  value={userRoleFilter} 
                  onChange={e => setUserRoleFilter(e.target.value)} 
                  className="border p-2 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                >
                  <option value="">All Teams</option>
                  <option value="website">Website Team</option>
                  <option value="youtube">YouTube Team</option>
                  <option value="twitter">Twitter Team</option>
                  <option value="facebook">Facebook Team</option>
                  <option value="it">IT Department</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-white border-b">
                    <tr>
                      <th className="px-4 md:px-6 py-4">Name</th>
                      <th className="px-4 md:px-6 py-4">Email</th>
                      <th className="px-4 md:px-6 py-4">Role</th>
                      <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => userRoleFilter === '' || u.role === userRoleFilter).map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-4 md:px-6 py-4 font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 md:px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-4 md:px-6 py-4">
                            <span className="capitalize bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition inline-flex items-center gap-1 font-medium text-xs border border-red-200">
                              <Trash2 size={14}/> Delete
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}