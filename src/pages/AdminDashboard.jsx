import Rooms from "./Rooms";
import Students from "./Students";
import Parents from "./Parents";
import RoomCleaning from "./RoomCleaning";
import Attendance from "./Attendance";
import MessBill from "./MessBill";
import Complaints from "./Complaints";
import Announcements from "./Announcements";
import Visitors from "./Visitors";
import OutingLeave from "./OutingLeave";
import { useEffect, useState } from "react";
import { clearAuth } from "../utils/auth";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({
    total_students: "--",
    total_rooms: "--",
    pending_complaints: "--",
    total_visitors: "--",
  });
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [cleaning, setCleaning] = useState([]);

  const fetchDashboardData = () => {
    fetch("http://127.0.0.1:5000/dashboard_stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
    fetch("http://127.0.0.1:5000/complaints")
      .then((res) => res.json())
      .then((data) => setComplaints(data));
    fetch("http://127.0.0.1:5000/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data));
    fetch("http://127.0.0.1:5000/room_allotment")
      .then((res) => res.json())
      .then((data) => setAllotments(data));
    fetch("http://127.0.0.1:5000/room_cleaning")
      .then((res) => res.json())
      .then((data) => setCleaning(data));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "students", label: "Students" },
    { id: "parents", label: "Parents" },
    { id: "rooms", label: "Rooms" },
    { id: "attendance", label: "Attendance" },
    { id: "messbill", label: "Mess Bill" },
    { id: "roomcleaning", label: "Room Cleaning" },
    { id: "announcements", label: "Announcements" },
    { id: "complaints", label: "Complaints" },
    { id: "outing", label: "Outing & Leave" },
    { id: "visitors", label: "Visitors" },
  ];

  const recentComplaints = complaints.slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);
  const cleanedToday = cleaning.filter((item) => item.status === "cleaned").length;
  const pendingCleaning = cleaning.filter((item) => item.status !== "cleaned").length;

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,_#f8fbff,_#f4f9ff_45%,_#f7fafc)]">
      <div className="w-64 flex flex-col border-r border-sky-100 bg-[linear-gradient(180deg,_#eff6ff,_#e0f2fe)] shadow-sm">
        <div className="border-b border-white/70 bg-white/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200">
              MH
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-800">MIMIT HMS</h1>
              <p className="mt-1 text-sm text-blue-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full rounded-xl px-4 py-3 text-left transition duration-200 ${
                activePage === item.id
                  ? "bg-[linear-gradient(135deg,_#2563eb,_#1d4ed8)] text-white shadow-lg shadow-blue-200 font-semibold"
                  : "text-gray-700 hover:bg-white/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/70 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-[linear-gradient(135deg,_#f87171,_#ef4444)] py-2.5 text-white shadow-md shadow-red-100 transition duration-200 hover:translate-y-[-1px]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        {activePage === "dashboard" && (
          <div>
            <div className="mb-8 rounded-[1.75rem] border border-white/80 bg-[linear-gradient(135deg,_#1d4ed8,_#2563eb_55%,_#0f766e)] p-8 text-white shadow-[0_20px_60px_rgba(37,99,235,0.16)]">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-blue-100">Admin Overview</p>
                  <h2 className="mt-3 text-3xl font-bold">Welcome, Warden</h2>
                  <p className="mt-3 max-w-2xl text-sm text-blue-100">
                    Keep track of hostel activity, student issues, room status, and approvals from one place.
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm md:block">
                  <p className="text-blue-100">Today's focus</p>
                  <p className="mt-2 font-medium">Complaints, room cleaning, leave approvals</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Total Students</p>
                <p className="mt-2 text-3xl font-bold text-blue-500">{stats.total_students}</p>
                <p className="mt-2 text-xs text-gray-400">Active hostel students</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Total Rooms</p>
                <p className="mt-2 text-3xl font-bold text-emerald-500">{stats.total_rooms}</p>
                <p className="mt-2 text-xs text-gray-400">Rooms available in system</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Complaints</p>
                <p className="mt-2 text-3xl font-bold text-rose-500">{stats.pending_complaints}</p>
                <p className="mt-2 text-xs text-gray-400">Waiting for action</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Visitor Records</p>
                <p className="mt-2 text-3xl font-bold text-amber-500">{stats.total_visitors}</p>
                <p className="mt-2 text-xs text-gray-400">Logged visitor entries</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Active Allotments</p>
                <p className="mt-2 text-3xl font-bold text-indigo-500">{allotments.length}</p>
                <p className="mt-2 text-xs text-gray-400">Students currently allotted</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Rooms Cleaned</p>
                <p className="mt-2 text-3xl font-bold text-teal-500">{cleanedToday}</p>
                <p className="mt-2 text-xs text-gray-400">Latest updates marked cleaned</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Cleaning Pending</p>
                <p className="mt-2 text-3xl font-bold text-orange-500">{pendingCleaning}</p>
                <p className="mt-2 text-xs text-gray-400">Awaiting student cleaning updates</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Recent Complaints</h3>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-500">{stats.pending_complaints} pending</span>
                </div>
                {recentComplaints.length === 0 ? (
                  <p className="text-sm text-gray-400">No complaints yet</p>
                ) : (
                  recentComplaints.map((item) => (
                    <div key={item.complaint_id} className="border-b border-gray-50 py-3 last:border-b-0">
                      <p className="font-medium text-gray-700">{item.student_name}</p>
                      <p className="text-sm text-gray-500">{item.complaint_text}</p>
                      <p className="mt-1 text-xs text-gray-400">Room {item.room_number} | {item.status} | {item.complaint_date}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Latest Announcements</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-500">{announcements.length} total</span>
                </div>
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-gray-400">No announcements posted yet</p>
                ) : (
                  recentAnnouncements.map((item) => (
                    <div key={item.announcement_id} className="border-b border-gray-50 py-3 last:border-b-0">
                      <p className="font-medium text-gray-700">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.message}</p>
                      <p className="mt-1 text-xs text-gray-400">Audience: {item.role} | {item.created_at}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activePage === "students" && <Students />}
        {activePage === "parents" && <Parents />}
        {activePage === "roomcleaning" && <RoomCleaning />}
        {activePage === "rooms" && <Rooms />}
        {activePage === "attendance" && <Attendance />}
        {activePage === "messbill" && <MessBill />}
        {activePage === "complaints" && <Complaints />}
        {activePage === "announcements" && <Announcements />}
        {activePage === "visitors" && <Visitors />}
        {activePage === "outing" && <OutingLeave />}

        {activePage !== "dashboard" && activePage !== "students" && activePage !== "parents" && activePage !== "roomcleaning" && activePage !== "rooms" && activePage !== "attendance" && activePage !== "messbill" && activePage !== "complaints" && activePage !== "announcements" && activePage !== "visitors" && activePage !== "outing" && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-700">
              {menuItems.find((m) => m.id === activePage)?.label}
            </h2>
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <p className="text-gray-400">This module is coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
