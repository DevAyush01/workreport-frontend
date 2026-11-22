import { useState, useEffect } from 'react';
import api from '../api';
import { FileText, LogOut, Send, Clock, Link as LinkIcon, AlertCircle, LayoutDashboard, List } from 'lucide-react';

export default function UserDashboard({ user, setUser }) {
  // Sidebar tabs ke liye state
  const [activeTab, setActiveTab] = useState('submit'); 
  
  const [reports, setReports] = useState([]);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    in_time: currentTime,
    out_time: '',
    work_description: '', 
    hours_spent: '', 
    links: '',
    pending_work: '',
    pending_reason: ''
  });

  const fetchReports = async () => {
    const res = await api.get('/reports');
    setReports(res.data);
  };

  useEffect(() => { fetchReports(); }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...form,
        hours_spent: form.hours_spent === '' ? null : form.hours_spent
      };
      await api.post('/reports', dataToSend);
      setForm({ ...form, work_description: '', hours_spent: '', links: '', pending_work: '', pending_reason: '' });
      fetchReports();
      alert("Report submitted successfully!");
      setActiveTab('history'); // Submit hone ke baad history tab par bhej dein
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting report");
    }
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  const renderLinks = (links) => {
    if (!links) return '-';
    
    // Comma (,) aur Newline (\n) dono se link ko alag karein
    const linkArray = links.split(/[,\n]+/).filter(link => link.trim() !== '');
    
    return linkArray.map((link, index) => {
      let cleanLink = link.trim();
      // Agar user ne http/https nahi lagaya, toh auto lagayein
      if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
        cleanLink = 'https://' + cleanLink;
      }
      
      return (
        <a 
          key={index} 
          href={cleanLink} 
          target="_blank" 
          rel="noreferrer" 
          className="text-blue-500 hover:underline block text-xs truncate max-w-[150px] mb-1"
          title={cleanLink}
        >
          {link.trim()}
        </a>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-2">
          <FileText className="text-blue-500" /> MyWorkspace
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${activeTab === 'submit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-gray-300'}`}
          >
            <LayoutDashboard size={20} /> Submit Daily Report
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-gray-300'}`}
          >
            <List size={20} /> My Reports
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-slate-800 rounded-lg">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {activeTab === 'submit' ? "Today's Work Form" : "My Work History"}
            </h2>
            <p className="text-gray-500 capitalize">Welcome, {user.name} ({user.role} Team)</p>
          </div>
        </header>

        {/* TAB 1: SUBMIT REPORT FORM (Full Width) */}
        {activeTab === 'submit' && (
          <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={submitReport} className="space-y-5">
              
              {/* 1. Date, In Time, Out Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1"><Clock size={14}/> In Time</label>
                  <input type="time" value={form.in_time} onChange={e => setForm({...form, in_time: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1"><Clock size={14}/> Out Time</label>
                  <input type="time" value={form.out_time} onChange={e => setForm({...form, out_time: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              
              {/* 2. Work Description (Full Width) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Work Description</label>
                <textarea placeholder="What did you work on today?" value={form.work_description} onChange={e => setForm({...form, work_description: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="3" required />
              </div>

              {/* 3. Links (Full Width) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1"><LinkIcon size={14}/> Links (Comma Separated)</label>
                <textarea 
                  placeholder="https://link1.com, https://link2.com" 
                  value={form.links} 
                  onChange={e => setForm({...form, links: e.target.value})} 
                  className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  rows="2"
                />
              </div>

                           {/* 4. Total Hours */}
              <div className="md:w-1/3">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Total Hours (Optional)</label>
                <input type="number" step="0.5" placeholder="e.g. 4" value={form.hours_spent} onChange={e => setForm({...form, hours_spent: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {/* 5. Pending Work (Full Width) */}
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl space-y-3">
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={14}/> Pending Work (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input type="text" placeholder="What is pending?" value={form.pending_work} onChange={e => setForm({...form, pending_work: e.target.value})} className="w-full border border-orange-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
                  </div>
                  <div>
                    <input type="text" placeholder="Reason for pending?" value={form.pending_reason} onChange={e => setForm({...form, pending_reason: e.target.value})} className="w-full border border-orange-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold shadow-md transition flex justify-center items-center gap-2">
                <Send size={18}/> Submit Daily Report
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY REPORTS HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <List className="text-blue-600" size={20} /> My Submitted Reports ({reports.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">In / Out</th>
                    <th className="px-6 py-4">Work Description</th>
                    <th className="px-6 py-4">Hours</th>
                    <th className="px-6 py-4">Links</th>
                    <th className="px-6 py-4">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{r.in_time} <br/> {r.out_time}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={r.work_description}>{r.work_description}</td>
                      <td className="px-6 py-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">{r.hours_spent || 0}h</span></td>
                      <td className="px-6 py-4">{renderLinks(r.links)}</td>
                      <td className="px-6 py-4 text-red-500 text-xs max-w-[150px]" title={`Reason: ${r.pending_reason || 'N/A'}`}>
                        {r.pending_work || '-'}
                        {r.pending_reason && <span className="block text-gray-400 mt-1">({r.pending_reason})</span>}
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
  );
}