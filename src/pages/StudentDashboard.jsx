import { useEffect, useState } from "react";
import { clearAuth } from "../utils/auth";

function StudentDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [outing, setOuting] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [roomCleaning, setRoomCleaning] = useState({ student: null, records: [] });
  const [complaintText, setComplaintText] = useState("");
  const [cleaningForm, setCleaningForm] = useState({
    cleaning_date: new Date().toISOString().split("T")[0],
    status: "cleaned",
    remarks: "",
  });
  const [outingForm, setOutingForm] = useState({
    reason: "",
    outing_date: new Date().toISOString().split("T")[0],
    out_time: "",
    in_time: "",
  });
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    applied_on: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const userId = localStorage.getItem("user_id");

  const fetchAll = () => {
    fetch(`http://127.0.0.1:5000/student_dashboard/${userId}`).then((res) => res.json()).then(setDashboard);
    fetch(`http://127.0.0.1:5000/student_attendance/${userId}`).then((res) => res.json()).then(setAttendance);
    fetch(`http://127.0.0.1:5000/student_mess_bill/${userId}`).then((res) => res.json()).then(setBills);
    fetch(`http://127.0.0.1:5000/student_complaints/${userId}`).then((res) => res.json()).then(setComplaints);
    fetch(`http://127.0.0.1:5000/student_outing/${userId}`).then((res) => res.json()).then(setOuting);
    fetch(`http://127.0.0.1:5000/student_leave/${userId}`).then((res) => res.json()).then(setLeaveRequests);
    fetch(`http://127.0.0.1:5000/student_room_cleaning/${userId}`).then((res) => res.json()).then(setRoomCleaning);
    fetch("http://127.0.0.1:5000/student_announcements").then((res) => res.json()).then(setAnnouncements);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const handleComplaintSubmit = async () => {
    const response = await fetch(`http://127.0.0.1:5000/student_complaints/add/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaint_text: complaintText,
        complaint_date: new Date().toISOString().split("T")[0],
      }),
    });
    const data = await response.json();
    if (data.status === "success") {
      setComplaintText("");
      fetchAll();
    }
  };

  const handleCleaningSubmit = async () => {
    const response = await fetch(`http://127.0.0.1:5000/student_room_cleaning/update/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaningForm),
    });
    const data = await response.json();
    if (data.status === "success") {
      setCleaningForm({
        cleaning_date: new Date().toISOString().split("T")[0],
        status: "cleaned",
        remarks: "",
      });
      fetchAll();
    } else if (data.message) {
      alert(data.message);
    }
  };

  const handleOutingSubmit = async () => {
    const response = await fetch(`http://127.0.0.1:5000/student_outing/add/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outingForm),
    });
    const data = await response.json();
    if (data.status === "success") {
      setOutingForm({
        reason: "",
        outing_date: new Date().toISOString().split("T")[0],
        out_time: "",
        in_time: "",
      });
      fetchAll();
    }
  };

  const handleLeaveSubmit = async () => {
    const response = await fetch(`http://127.0.0.1:5000/student_leave/add/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    });
    const data = await response.json();
    if (data.status === "success") {
      setLeaveForm({
        reason: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        applied_on: new Date().toISOString().split("T")[0],
        remarks: "",
      });
      fetchAll();
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "myroom", label: "My Room" },
    { id: "attendance", label: "Attendance" },
    { id: "messbill", label: "Mess Bill" },
    { id: "complaints", label: "Complaints" },
    { id: "roomcleaning", label: "Room Cleaning" },
    { id: "outing", label: "Outing Request" },
    { id: "leave", label: "Leave Request" },
    { id: "announcements", label: "Announcements" },
  ];

  const student = dashboard?.student;
  const pendingOuting = outing.filter((item) => item.warden_status === "Pending").length;
  const latestAnnouncements = announcements.slice(0, 3);
  const latestComplaints = complaints.slice(0, 3);
  const latestCleaning = roomCleaning.records[0];

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,_#f6fbf8,_#f8fbff_50%,_#ffffff)]">
      <div className="w-64 flex flex-col border-r border-emerald-100 bg-[linear-gradient(180deg,_#ecfdf5,_#dcfce7)] shadow-sm">
        <div className="border-b border-white/70 bg-white/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-200">
              MH
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">MIMIT HMS</h1>
              <p className="mt-1 text-sm text-emerald-500">Student Panel</p>
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
                  ? "bg-[linear-gradient(135deg,_#16a34a,_#15803d)] text-white shadow-lg shadow-emerald-200 font-semibold"
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
            <div className="mb-8 rounded-[1.75rem] border border-white/80 bg-[linear-gradient(135deg,_#16a34a,_#10b981_55%,_#0f766e)] p-8 text-white shadow-[0_20px_60px_rgba(16,185,129,0.16)]">
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-100">Student Overview</p>
              <h2 className="mt-3 text-3xl font-bold">Welcome, {student?.name || "Student"}</h2>
              <p className="mt-3 max-w-2xl text-sm text-emerald-100">
                Track your room, attendance, cleaning updates, complaints, and hostel requests from one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">My Room</p>
                <p className="mt-2 text-3xl font-bold text-emerald-500">{student?.room_number || "Not Allotted"}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Attendance</p>
                <p className="mt-2 text-3xl font-bold text-blue-500">{dashboard?.attendance_percentage || 0}%</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Bills</p>
                <p className="mt-2 text-3xl font-bold text-rose-500">{dashboard?.pending_bills || 0}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Room Type</p>
                <p className="mt-2 text-2xl font-bold text-teal-500">{student?.room_type || "-"}</p>
                <p className="mt-2 text-xs text-gray-400">Your room preference</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Pending Outing</p>
                <p className="mt-2 text-2xl font-bold text-amber-500">{pendingOuting}</p>
                <p className="mt-2 text-xs text-gray-400">Requests in approval flow</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm text-gray-400">Latest Cleaning</p>
                <p className="mt-2 text-2xl font-bold text-cyan-500">{latestCleaning?.status || "Not Updated"}</p>
                <p className="mt-2 text-xs text-gray-400">{latestCleaning?.cleaning_date || "No cleaning update yet"}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Profile Snapshot</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">Name:</span> {student?.name || "-"}</p>
                  <p><span className="font-medium text-gray-700">Course:</span> {student?.course || "-"}</p>
                  <p><span className="font-medium text-gray-700">Semester:</span> {student?.semester || "-"}</p>
                  <p><span className="font-medium text-gray-700">Room:</span> {student?.room_number || "Not Allotted"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Recent Announcements</h3>
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

            <div className="mt-6 rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Recent Complaint Status</h3>
              {latestComplaints.length === 0 ? (
                <p className="text-sm text-gray-400">No complaints submitted yet</p>
              ) : (
                latestComplaints.map((item) => (
                  <div key={item.complaint_id} className="border-b border-gray-50 py-3 last:border-b-0">
                    <p className="text-gray-700">{item.complaint_text}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.complaint_date} | {item.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePage === "myroom" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">My Room</h2>
            <p className="mb-2 text-gray-600">Room Number: {student?.room_number || "Not Allotted"}</p>
            <p className="mb-2 text-gray-600">Room Type: {student?.room_type || "-"}</p>
            <p className="text-gray-600">Course / Semester: {student ? `${student.course} / ${student.semester}` : "-"}</p>
          </div>
        )}

        {activePage === "attendance" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Attendance</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100"><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3">Marked By</th></tr></thead>
              <tbody>
                {attendance.map((row) => (
                  <tr key={row.attendance_id} className="border-b border-gray-50"><td className="py-3">{row.date}</td><td className="py-3">{row.status}</td><td className="py-3">{row.marked_by}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activePage === "messbill" && (
          <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-700">Mess Bill</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100"><th className="pb-3">Month</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.mess_bill_id} className="border-b border-gray-50"><td className="py-3">{bill.month}</td><td className="py-3">Rs. {bill.amount}</td><td className="py-3">{bill.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activePage === "complaints" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h2 className="mb-4 text-2xl font-bold text-gray-700">Raise Complaint</h2>
              <textarea
                rows="4"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
              <button onClick={handleComplaintSubmit} className="mt-4 rounded-xl bg-[linear-gradient(135deg,_#16a34a,_#15803d)] px-6 py-2.5 text-white shadow-md shadow-emerald-100">Submit</button>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">My Complaints</h3>
              {complaints.map((item) => <div key={item.complaint_id} className="border-b border-gray-50 py-3"><p>{item.complaint_text}</p><p className="text-sm text-gray-400">{item.complaint_date} | {item.status}</p></div>)}
            </div>
          </div>
        )}

        {activePage === "roomcleaning" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h2 className="mb-4 text-2xl font-bold text-gray-700">Room Cleaning Update</h2>
              <p className="mb-4 text-sm text-gray-500">Update whether your room has been cleaned. The warden will see this status in the admin panel.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-500">Room</label>
                  <input type="text" value={roomCleaning.student?.room_number || "Not Allotted"} disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">Date</label>
                  <input type="date" value={cleaningForm.cleaning_date} onChange={(e) => setCleaningForm({ ...cleaningForm, cleaning_date: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">Status</label>
                  <select value={cleaningForm.status} onChange={(e) => setCleaningForm({ ...cleaningForm, status: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2">
                    <option value="cleaned">Cleaned</option>
                    <option value="not cleaned">Not Cleaned</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">Remarks</label>
                  <input type="text" value={cleaningForm.remarks} onChange={(e) => setCleaningForm({ ...cleaningForm, remarks: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2" />
                </div>
              </div>
              <button onClick={handleCleaningSubmit} className="mt-4 rounded-xl bg-[linear-gradient(135deg,_#16a34a,_#15803d)] px-6 py-2.5 text-white shadow-md shadow-emerald-100">Save Update</button>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">My Cleaning History</h3>
              {roomCleaning.records.length === 0 ? (
                <p className="text-sm text-gray-400">No room cleaning updates yet</p>
              ) : (
                roomCleaning.records.map((item) => (
                  <div key={item.cleaning_id} className="border-b border-gray-50 py-3 last:border-b-0">
                    <p className="font-medium text-gray-700">{item.status}</p>
                    <p className="text-sm text-gray-400">{item.cleaning_date}</p>
                    {item.remarks && <p className="mt-1 text-sm text-gray-500">{item.remarks}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePage === "outing" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h2 className="mb-4 text-2xl font-bold text-gray-700">Outing Request</h2>
              <p className="mb-4 text-sm text-gray-500">Your parent will review this first. After parent approval, it goes to the warden.</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Reason" value={outingForm.reason} onChange={(e) => setOutingForm({ ...outingForm, reason: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="date" value={outingForm.outing_date} onChange={(e) => setOutingForm({ ...outingForm, outing_date: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="time" value={outingForm.out_time} onChange={(e) => setOutingForm({ ...outingForm, out_time: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="time" value={outingForm.in_time} onChange={(e) => setOutingForm({ ...outingForm, in_time: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
              </div>
              <button onClick={handleOutingSubmit} className="mt-4 rounded-xl bg-[linear-gradient(135deg,_#16a34a,_#15803d)] px-6 py-2.5 text-white shadow-md shadow-emerald-100">Submit</button>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              {outing.map((item) => <div key={item.outing_id} className="border-b border-gray-50 py-3"><p>{item.reason}</p><p className="text-sm text-gray-400">{item.outing_date} | Parent: {item.parent_status} | Warden: {item.warden_status}</p></div>)}
            </div>
          </div>
        )}

        {activePage === "leave" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <h2 className="mb-4 text-2xl font-bold text-gray-700">Leave Request</h2>
              <p className="mb-4 text-sm text-gray-500">Your parent will review this first. After parent approval, it goes to the warden.</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
                <input type="text" placeholder="Remarks" value={leaveForm.remarks} onChange={(e) => setLeaveForm({ ...leaveForm, remarks: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-2" />
              </div>
              <button onClick={handleLeaveSubmit} className="mt-4 rounded-xl bg-[linear-gradient(135deg,_#16a34a,_#15803d)] px-6 py-2.5 text-white shadow-md shadow-emerald-100">Submit</button>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              {leaveRequests.map((item) => <div key={item.leave_id} className="border-b border-gray-50 py-3"><p>{item.reason}</p><p className="text-sm text-gray-400">{item.start_date} to {item.end_date} | Parent: {item.parent_status} | Warden: {item.warden_status}</p></div>)}
            </div>
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

export default StudentDashboard;
