import React, { useState } from 'react';
import { UserCheck, Plus, Shield, Mail, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StaffView: React.FC = () => {
  const { data, addStaff } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Staff' as const });

  const staffList = data?.staff || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStaff(form);
    setIsOpen(false);
    setForm({ name: '', email: '', phone: '', role: 'Staff' });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Staff & Role Management</h2>
          <p className="text-sm text-slate-500">Manage store associates, managers, permissions, and staff accounts.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((st) => (
          <div key={st.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {st.name.charAt(0)}
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                {st.role}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">{st.name}</h3>
              <div className="space-y-1.5 mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{st.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{st.phone}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Joined: {st.joinedDate}</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">{st.status}</span>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Invite New Staff Member</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Daniyal Khan"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="daniyal@shopflow.ai"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 300 9876543"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role / Permissions</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-md hover:bg-purple-700"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
