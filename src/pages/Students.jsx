import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    course: "",
    semester: "",
    room_type: "",
    parent_id: "",
    username: "",
    password: "",
  });
  const [parentForm, setParentForm] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
  });

  const fetchStudents = () => {
    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const fetchParents = () => {
    fetch("http://127.0.0.1:5000/parents")
      .then((res) => res.json())
      .then((data) => setParents(data));
  };

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  const resetStudentForm = () => {
    setShowForm(!showForm);
    setShowParentForm(false);
    setEditStudent(null);
    setError("");
    setForm({
      name: "",
      course: "",
      semester: "",
      room_type: "",
      parent_id: "",
      username: "",
      password: "",
    });
  };

  const handleAdd = async () => {
    setError("");
    const response = await fetch("http://127.0.0.1:5000/students/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setForm({ name: "", course: "", semester: "", room_type: "", parent_id: "", username: "", password: "" });
      fetchStudents();
    } else if (data.message) {
      setError(data.message);
    }
  };

  const handleAddParent = async () => {
    const response = await fetch("http://127.0.0.1:5000/parents/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parentForm),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowParentForm(false);
      setParentForm({ name: "", phone: "", username: "", password: "" });
      fetchParents();
      setForm((prev) => ({ ...prev, parent_id: String(data.user_id) }));
    } else if (data.message) {
      setError(data.message);
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setForm({
      name: student.name,
      course: student.course,
      semester: student.semester,
      room_type: student.room_type,
      parent_id: student.parent_id || "",
      username: student.student_username || "",
      password: "",
    });
    setShowForm(true);
    setError("");
  };

  const handleUpdate = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/students/edit/${editStudent.student_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditStudent(null);
      setForm({ name: "", course: "", semester: "", room_type: "", parent_id: "", username: "", password: "" });
      fetchStudents();
    }
  };

  const handleDelete = async (student_id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/students/delete/${student_id}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchStudents();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Students</h2>
        <button
          onClick={resetStudentForm}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {showForm ? "Cancel" : "Add Student"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editStudent ? "Edit Student" : "New Student"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Course</label>
              <input type="text" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Semester</label>
              <input type="text" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Room Type</label>
              <select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2">
                <option value="">Select type</option>
                <option value="Single">Single</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Parent</label>
              <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2">
                <option value="">Select parent</option>
                {parents.map((parent) => (
                  <option key={parent.parent_id} value={parent.user_id}>
                    {parent.name} ({parent.username})
                  </option>
                ))}
              </select>
              {!editStudent && (
                <button onClick={() => setShowParentForm(!showParentForm)} className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                  {showParentForm ? "Cancel Parent Form" : "Add New Parent"}
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Student Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={Boolean(editStudent)} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
            </div>
            {!editStudent && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Student Password</label>
                <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
              </div>
            )}
          </div>

          {showParentForm && !editStudent && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-4">New Parent</h4>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Parent name" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-2" />
                <input type="text" placeholder="Phone" value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-2" />
                <input type="text" placeholder="Parent username" value={parentForm.username} onChange={(e) => setParentForm({ ...parentForm, username: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-2" />
                <input type="text" placeholder="Parent password" value={parentForm.password} onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-2" />
              </div>
              <button onClick={handleAddParent} className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg">Save Parent</button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            onClick={editStudent ? handleUpdate : handleAdd}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editStudent ? "Update Student" : "Save Student"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">ID</th>
              <th className="pb-3 text-gray-500 font-medium">Name</th>
              <th className="pb-3 text-gray-500 font-medium">Username</th>
              <th className="pb-3 text-gray-500 font-medium">Parent</th>
              <th className="pb-3 text-gray-500 font-medium">Course</th>
              <th className="pb-3 text-gray-500 font-medium">Semester</th>
              <th className="pb-3 text-gray-500 font-medium">Room Type</th>
              <th className="pb-3 text-gray-500 font-medium">Room No</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-gray-400 py-6">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.student_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{student.student_id}</td>
                  <td className="py-3 text-gray-600">{student.name}</td>
                  <td className="py-3 text-gray-600">{student.student_username || "-"}</td>
                  <td className="py-3 text-gray-600">{student.parent_name || "-"}</td>
                  <td className="py-3 text-gray-600">{student.course}</td>
                  <td className="py-3 text-gray-600">{student.semester}</td>
                  <td className="py-3 text-gray-600">{student.room_type}</td>
                  <td className="py-3 text-gray-600">{student.room_number ? student.room_number : "Not Allotted"}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => handleEdit(student)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm">Edit</button>
                    <button onClick={() => handleDelete(student.student_id)} className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Delete</button>
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

export default Students;
