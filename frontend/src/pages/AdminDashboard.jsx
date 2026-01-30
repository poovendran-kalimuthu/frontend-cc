import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  FiSearch, FiDownload, FiUsers, FiCheckCircle, 
  FiXCircle, FiMoreVertical, FiFilter, FiRefreshCw,
  FiTrendingUp, FiCalendar, FiClock, FiChevronRight,
  FiEdit2, FiSave, FiX
} from "react-icons/fi";
import { HiOutlineUserGroup, HiOutlineDocumentReport } from "react-icons/hi";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/auth/users", {
        withCredentials: true
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateAttendance = async (studentId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/auth/users/${studentId}/attendance`,
        { hasAttended: newStatus === "present" },
        { withCredentials: true }
      );
      
      setStudents(prev => prev.map(student => 
        student._id === studentId 
          ? { 
              ...student, 
              hasAttended: newStatus === "present",
              attendedAt: newStatus === "present" ? new Date().toISOString() : null 
            }
          : student
      ));
      
      setEditingStudent(null);
      setEditingStatus("");
    } catch (err) {
      console.error("Update attendance error:", err);
      alert("Failed to update attendance. Please try again.");
    }
  };

  // Enhanced logical calculations for stats
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.hasAttended).length;
    const absent = total - present;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    const yesterdayRate = 85.2; // Mock data
    const trend = rate > yesterdayRate ? "up" : rate < yesterdayRate ? "down" : "same";
    
    return { total, present, absent, rate, trend, change: Math.abs(rate - yesterdayRate).toFixed(1) };
  }, [students]);

  const filteredStudents = students.filter((item) => {
    const matchesSearch = 
      item?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.rollNo?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ? true : 
      statusFilter === "present" ? item.hasAttended : !item.hasAttended;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Name,Roll No,Class,Status,Time\n"];
    const data = filteredStudents.map(s => 
      `${s.name},${s.rollNo},${s.className},${s.hasAttended ? 'Present' : 'Absent'},${s.attendedAt || 'N/A'}`
    ).join("\n");
    const blob = new Blob([headers + data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading Dashboard...</p>
        <p className="text-sm text-slate-400 mt-2">Syncing attendance data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 hidden xl:flex flex-col p-6 text-white shadow-2xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Portal.Admin</h2>
              <p className="text-xs text-slate-300">Dashboard v2.1</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-l-4 border-blue-500 text-blue-100 p-3 rounded-lg flex items-center gap-3">
            <HiOutlineDocumentReport size={20} /> Dashboard
          </div>
          <button className="w-full text-left text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg flex items-center gap-3 transition-all">
            <HiOutlineUserGroup size={20} /> Student Management
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg flex items-center gap-3 transition-all">
            <FiCalendar size={20} /> Calendar View
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg flex items-center gap-3 transition-all">
            <FiClock size={20} /> Attendance History
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="font-bold">AD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Admin User</p>
              <p className="text-xs text-slate-300">Super Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>Dashboard</span>
                <FiChevronRight />
                <span className="text-blue-600 font-medium">Attendance Oversight</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Attendance Oversight
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">
                Monitor and manage student attendance records in real-time
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={loadUsers}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-600 hover:shadow-md hover:-translate-y-0.5"
              >
                <FiRefreshCw /> Refresh Data
              </button>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-0.5"
              >
                <FiDownload /> Export Report
              </button>
            </div>
          </div>
          
          {/* Date Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["today", "week", "month", "all"].map((period) => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateFilter === period
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          <StatCard 
            icon={<FiUsers className="text-blue-600"/>} 
            label="Total Enrolled" 
            value={stats.total} 
            color="bg-gradient-to-br from-blue-50 to-blue-100"
            trend="up"
            change="2.3%"
            period="vs last week"
          />
          <StatCard 
            icon={<FiCheckCircle className="text-emerald-600"/>} 
            label="Present Today" 
            value={stats.present} 
            color="bg-gradient-to-br from-emerald-50 to-emerald-100"
            trend={stats.trend}
            change={`${stats.change}%`}
            period="vs yesterday"
          />
          <StatCard 
            icon={<FiXCircle className="text-rose-600"/>} 
            label="Absent Today" 
            value={stats.absent} 
            color="bg-gradient-to-br from-rose-50 to-rose-100"
            trend={stats.trend === "up" ? "down" : "up"}
            change={`${stats.change}%`}
            period="vs yesterday"
          />
          <StatCard 
            icon={<FiTrendingUp className="text-violet-600"/>} 
            label="Attendance Rate" 
            value={`${stats.rate}%`} 
            color="bg-gradient-to-br from-violet-50 to-violet-100"
            trend={stats.trend}
            change={`${stats.change}%`}
            period="vs yesterday"
          />
        </div>

        {/* Enhanced Controls Section */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200/50 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex-1 max-w-2xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">Search & Filter Students</p>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll number, or class..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3 min-w-[200px]">
                <FiFilter className="text-slate-400 flex-shrink-0" />
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium shadow-sm"
                >
                  <option value="all">All Students</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm">
                  More Filters
                </button>
                <button className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium text-sm">
                  Save View
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-600">Present:</span>
              <span className="font-bold text-slate-900">{stats.present}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
              <span className="text-slate-600">Absent:</span>
              <span className="font-bold text-slate-900">{stats.absent}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-slate-600">Total:</span>
              <span className="font-bold text-slate-900">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
              <span className="text-slate-600">Rate:</span>
              <span className="font-bold text-slate-900">{stats.rate}%</span>
            </div>
          </div>
        </div>

        {/* Enhanced Table Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Attendance</h3>
              <p className="text-sm text-slate-500">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-50/80 backdrop-blur-sm">
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Student Profile</th>
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Roll No</th>
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Class</th>
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Timestamp</th>
                  <th className="px-6 lg:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student._id} 
                    className={`group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 ${
                      index < filteredStudents.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <td className="px-6 lg:px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 border border-slate-200/50">
                            {student.name.charAt(0)}
                          </div>
                          {student.hasAttended && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                              <FiCheckCircle size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{student.name}</span>
                          <span className="text-xs text-slate-500">ID: {student._id?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        {student.rollNo}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold uppercase tracking-wide">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      {editingStudent === student._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="">Select Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </div>
                      ) : (
                        <StatusBadge active={student.hasAttended} />
                      )}
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {student.attendedAt ? new Date(student.attendedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) : "—"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {student.attendedAt ? new Date(student.attendedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          }) : "No time"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingStudent === student._id ? (
                          <>
                            <button
                              onClick={() => {
                                if (editingStatus) {
                                  updateAttendance(student._id, editingStatus);
                                }
                              }}
                              disabled={!editingStatus}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                editingStatus
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <FiSave size={14} /> Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingStudent(null);
                                setEditingStatus("");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-all"
                            >
                              <FiX size={14} /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingStudent(student._id);
                                setEditingStatus(student.hasAttended ? "present" : "absent");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all"
                            >
                              <FiEdit2 size={14} /> Edit
                            </button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600">
                              <FiMoreVertical />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="p-12 md:p-16 text-center">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FiUsers className="text-slate-300 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Try adjusting your search or filter criteria. If you believe this is an error, check your connection.
              </p>
              <button 
                onClick={() => {setSearch(''); setStatusFilter('all');}}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {/* Table Footer */}
          {filteredStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                Updated just now • Auto-refresh in 30s
              </p>
              <div className="flex items-center gap-4">
                <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  Previous
                </button>
                <div className="flex gap-1">
                  {[1, 2, 3].map(num => (
                    <button 
                      key={num}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        num === 1 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Edit Info Panel */}
        {editingStudent && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-2xl animate-slideUp">
            <div className="flex items-center gap-3">
              <FiEdit2 className="text-blue-300" />
              <div>
                <p className="font-bold">Editing Attendance</p>
                <p className="text-sm text-slate-300">Select new status and click Save</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Enhanced StatCard Component
const StatCard = ({ icon, label, value, color, trend, change, period }) => (
  <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === "up" ? "bg-emerald-100 text-emerald-700" : 
          trend === "down" ? "bg-rose-100 text-rose-700" : 
          "bg-slate-100 text-slate-700"
        }`}>
          <FiTrendingUp className={trend === "down" ? "rotate-90" : ""} />
          {change}
        </div>
      )}
    </div>
    <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
    <p className="text-2xl md:text-3xl font-black text-slate-900">{value}</p>
    {period && (
      <p className="text-xs text-slate-400 mt-2">{period}</p>
    )}
  </div>
);

// Enhanced StatusBadge Component
const StatusBadge = ({ active }) => (
  <div className="inline-flex items-center gap-2">
    <div className={`relative w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}>
      <div className={`absolute inset-0 rounded-full ${active ? 'bg-emerald-500/40' : 'bg-rose-500/40'} animate-ping`}></div>
    </div>
    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
      active 
        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200' 
        : 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200'
    }`}>
      {active ? "PRESENT" : "ABSENT"}
    </span>
  </div>
);

// Add CSS animation for slideUp
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default AdminDashboard;