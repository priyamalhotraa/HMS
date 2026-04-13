import { useEffect, useState } from "react";
import { clearAuth } from "../utils/auth";

function ParentDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [bills, setBills] = useState([]);
  const [outing, setOuting] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const userId = localStorage.getItem("user_id");

  const fetchAll = () => {
    fetch(`http://127.0.0.1:5000/parent_dashboard/${userId}`).then((res) => res.json()).then(setDashboard);
    fetch(`http://127.0.0.1:5000/parent_attendance/${userId}`).then((res) => res.json()).then(setAttendance);
    fetch(`http://127.0.0.1:5000/parent_mess_bill/${userId}`).then((res) => res.json()).then(setBills);
    fetch(`http://127.0.0.1:5000/parent_outing/${userId}`).then((res) => res.json()).then(setOuting);
    fetch(`http://127.0.0.1:5000/parent_leave/${userId}`).then((res) => res.json()).then(setLeaveRequests);
    fetch("http://127.0.0.1:5000/parent_announcements").then((res) => res.json()).then(setAnnouncements);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const updateOutingStatus = async (outingId, parentStatus) => {
    const response = await fetch(`http://127.0.0.1:5000/parent_outing/approve/${outingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_status: parentStatus }),
    });
    const data = await response.json();
    if (data.status === "success") fetchAll();
  };

  const updateLeaveStatus = async (leaveId, parentStatus) => {
    const response = await fetch(`http://127.0.0.1:5000/parent_leave/approve/${leaveId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_status: parentStatus }),
    });
    const data = await response.json();
    if (data.status === "success") fetchAll();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "mychild", label: "My Child" },
    { id: "attendance", label: "Attendance" },
    { id: "messbill", label: "Mess Bill" },
    { id: "outing", label: "Outing Approvals" },
    { id: "leave", label: "Leave Approvals" },
    { id: "announcements", label: "Announcements" },
  ];

  const firstChild = dashboard?.children?.[0];
  const pendingOuting = outing.filter((item) => item.parent_status === "Pending").length;
  const pendingLeave = leaveRequests.filter((item) => item.parent_status === "Pending").length;
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,_#fbf8ff,_#faf7ff_50%,_#ffffff)]">
      <div className="w-64 flex flex-col border-r border-yellow-100 bg-[linear-gradient(180deg,_#fffdf5,_#fef9c3)] shadow-sm">
        <div className="border-b border-white/70 bg-white/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500 text-sm font-bold text-white shadow-md shadow-yellow-100">
              MH
            </div>
            <div>
              <h1 className="text-xl font-bold text-yellow-700">MIMIT HMS</h1>
              <p className="mt-1 text-sm text-yellow-600">Parent Panel</p>
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
                  ? "bg-[linear-gradient(135deg,_#facc15,_#eab308)] text-white shadow-lg shadow-yellow-100 font-semibold"
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
            <div className="mb-8 rounded-[1.75rem] border border-white/80 bg-[linear-gradient(135deg,_#d97706,_#f59e0b_55%,_#facc15)] p-8 text-white shadow-[0_20px_60px_rgba(234,179,8,0.14)]">
              <p className="text-sm uppercase tracking-[0.22em] text-amber-50">Parent Overview</p>
              <h2 className="mt-3 text-3xl font-bold">Welcome, Parent</h2>
              <p className="mt-3 max-w-2xl text-sm text-amber-50">
                Follow your child's hostel updates, attendance, bills, and approval requests from one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Child's Room</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{firstChild?.room_number || "Not Allotted"}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Attendance</p>
                <p className="mt-2 text-3xl font-bold text-blue-500">{dashboard?.attendance_percentage || 0}%</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Approvals</p>
                <p className="mt-2 text-3xl font-bold text-rose-500">{dashboard?.pending_approvals || 0}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Children Linked</p>
                <p className="mt-2 text-2xl font-bold text-yellow-600">{dashboard?.children?.length || 0}</p>
                <p className="mt-2 text-xs text-gray-400">Students connected to this account</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Outing</p>
                <p className="mt-2 text-2xl font-bold text-amber-500">{pendingOuting}</p>
                <p className="mt-2 text-xs text-gray-400">Awaiting parent decision</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Leave</p>
                <p className="mt-2 text-2xl font-bold text-orange-500">{pendingLeave}</p>
                <p className="mt-2 text-xs text-gray-400">Leave requests waiting</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Child Overview</h3>
                {dashboard?.children?.length ? (
                  dashboard.children.map((child) => (
                    <div key={child.student_id} className="border-b border-gray-50 py-3 last:border-b-0">
                      <p className="font-medium text-gray-700">{child.name}</p>
                      <p className="text-sm text-gray-500">{child.course} / {child.semester}</p>
                      <p className="mt-1 text-xs text-gray-400">Room: {child.room_number || "Not Allotted"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No child linked yet</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Latest Announcements</h3>
                {latestAnnouncements.length === 0 ? (
                  <p className="text-sm text-gray-400">No announcements available</p>
                ) : (
                  latestAnnouncements.map((item) => (
                    <div key={item.announcement_id} className="border-b border-gray-50 py-3 last:border-b-0">
                      <p className="font-medium text-gray-700">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activePage === "mychild" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">My Child</h2>
            {dashboard?.children?.length ? dashboard.children.map((child) => (
              <div key={child.student_id} className="border-b border-gray-50 py-3">
                <p className="font-medium text-gray-700">{child.name}</p>
                <p className="text-sm text-gray-500">{child.course} / {child.semester}</p>
                <p className="text-sm text-gray-500">Room: {child.room_number || "Not Allotted"}</p>
              </div>
            )) : <p className="text-gray-400">No child linked yet.</p>}
          </div>
        )}

        {activePage === "attendance" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Attendance</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100"><th className="pb-3">Student</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr></thead>
              <tbody>{attendance.map((row) => <tr key={row.attendance_id} className="border-b border-gray-50"><td className="py-3">{row.student_name}</td><td className="py-3">{row.date}</td><td className="py-3">{row.status}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {activePage === "messbill" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Mess Bill</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100"><th className="pb-3">Student</th><th className="pb-3">Month</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead>
              <tbody>{bills.map((bill) => <tr key={bill.mess_bill_id} className="border-b border-gray-50"><td className="py-3">{bill.student_name}</td><td className="py-3">{bill.month}</td><td className="py-3">Rs. {bill.amount}</td><td className="py-3">{bill.status}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {activePage === "outing" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Outing Approvals</h2>
            {outing.map((item) => (
              <div key={item.outing_id} className="flex items-center justify-between gap-4 border-b border-gray-50 py-3">
                <div>
                  <p className="font-medium text-gray-700">{item.student_name}</p>
                  <p className="text-sm text-gray-400">{item.reason} | {item.outing_date}</p>
                  <p className="text-sm text-gray-400">Parent: {item.parent_status} | Warden: {item.warden_status}</p>
                </div>
                <div className="flex gap-2">
                  {item.parent_status === "Pending" ? (
                    <>
                      <button onClick={() => updateOutingStatus(item.outing_id, "Approved")} className="rounded-xl bg-green-500 px-3 py-1 text-sm text-white">Approve</button>
                      <button onClick={() => updateOutingStatus(item.outing_id, "Rejected")} className="rounded-xl bg-red-400 px-3 py-1 text-sm text-white">Reject</button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Decision given</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activePage === "leave" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Leave Approvals</h2>
            {leaveRequests.map((item) => (
              <div key={item.leave_id} className="flex items-center justify-between gap-4 border-b border-gray-50 py-3">
                <div>
                  <p className="font-medium text-gray-700">{item.student_name}</p>
                  <p className="text-sm text-gray-400">{item.reason} | {item.start_date} to {item.end_date}</p>
                  <p className="text-sm text-gray-400">Parent: {item.parent_status} | Warden: {item.warden_status}</p>
                </div>
                <div className="flex gap-2">
                  {item.parent_status === "Pending" ? (
                    <>
                      <button onClick={() => updateLeaveStatus(item.leave_id, "Approved")} className="rounded-xl bg-green-500 px-3 py-1 text-sm text-white">Approve</button>
                      <button onClick={() => updateLeaveStatus(item.leave_id, "Rejected")} className="rounded-xl bg-red-400 px-3 py-1 text-sm text-white">Reject</button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Decision given</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activePage === "announcements" && (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.announcement_id} className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <h3 className="text-lg font-semibold text-gray-700">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{item.created_at}</p>
                <p className="mt-3 text-gray-600">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParentDashboard;
