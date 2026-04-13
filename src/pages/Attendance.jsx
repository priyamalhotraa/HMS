import { useEffect, useState } from "react";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAttendance, setEditAttendance] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    student_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present",
    marked_by: "Warden",
  });

  const fetchStudents = () => {
    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const fetchAttendance = () => {
    fetch("http://127.0.0.1:5000/attendance")
      .then((res) => res.json())
      .then((data) => setAttendance(data));
  };

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, []);

  const handleSubmit = async () => {
    setError("");
    const url = editAttendance
      ? `http://127.0.0.1:5000/attendance/edit/${editAttendance.attendance_id}`
      : "http://127.0.0.1:5000/attendance/add";
    const method = editAttendance ? "PUT" : "POST";
    const payload = editAttendance
      ? {
          date: form.date,
          status: form.status,
          marked_by: form.marked_by,
        }
      : form;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditAttendance(null);
      setForm({
        student_id: "",
        date: new Date().toISOString().split("T")[0],
        status: "Present",
        marked_by: "Warden",
      });
      fetchAttendance();
    } else if (data.message) {
      setError(data.message);
    }
  };

  const handleEdit = (entry) => {
    setEditAttendance(entry);
    setShowForm(true);
    setError("");
    setForm({
      student_id: entry.student_id,
      date: entry.date,
      status: entry.status,
      marked_by: entry.marked_by,
    });
  };

  const handleDelete = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;

    const response = await fetch(
      `http://127.0.0.1:5000/attendance/delete/${attendanceId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchAttendance();
    }
  };

  const resetForm = () => {
    setShowForm(!showForm);
    setEditAttendance(null);
    setError("");
    setForm({
      student_id: "",
      date: new Date().toISOString().split("T")[0],
      status: "Present",
      marked_by: "Warden",
    });
  };

  const presentCount = attendance.filter((entry) => entry.status === "Present").length;
  const absentCount = attendance.filter((entry) => entry.status === "Absent").length;
  const leaveCount = attendance.filter((entry) => entry.status === "Leave").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Attendance</h2>
        <button
          onClick={resetForm}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {showForm ? "Cancel" : "Mark Attendance"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Present Records</p>
          <p className="text-3xl font-bold text-green-500 mt-2">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Absent Records</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Leave Records</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{leaveCount}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editAttendance ? "Edit Attendance Entry" : "New Attendance Entry"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Student</label>
              <select
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                disabled={Boolean(editAttendance)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Marked By</label>
              <input
                type="text"
                value={form.marked_by}
                onChange={(e) => setForm({ ...form, marked_by: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editAttendance ? "Update Attendance" : "Save Attendance"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Student</th>
              <th className="pb-3 text-gray-500 font-medium">Course</th>
              <th className="pb-3 text-gray-500 font-medium">Semester</th>
              <th className="pb-3 text-gray-500 font-medium">Date</th>
              <th className="pb-3 text-gray-500 font-medium">Status</th>
              <th className="pb-3 text-gray-500 font-medium">Marked By</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-6">
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendance.map((entry) => (
                <tr key={entry.attendance_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{entry.name}</td>
                  <td className="py-3 text-gray-600">{entry.course}</td>
                  <td className="py-3 text-gray-600">{entry.semester}</td>
                  <td className="py-3 text-gray-600">{entry.date}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        entry.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : entry.status === "Absent"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{entry.marked_by}</td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.attendance_id)}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
