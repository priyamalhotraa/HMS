import { useEffect, useState } from "react";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllotmentForm, setShowAllotmentForm] = useState(false);
  const [error, setError] = useState("");
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    capacity: "",
  });
  const [allotmentForm, setAllotmentForm] = useState({
    student_id: "",
    room_id: "",
    allotment_date: new Date().toISOString().split("T")[0],
  });

  const fetchRooms = () => {
    fetch("http://127.0.0.1:5000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  };

  const fetchStudents = () => {
    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const fetchAllotments = () => {
    fetch("http://127.0.0.1:5000/room_allotment")
      .then((res) => res.json())
      .then((data) => setAllotments(data));
  };

  useEffect(() => {
    fetchRooms();
    fetchStudents();
    fetchAllotments();
  }, []);

  const handleAdd = async () => {
    const response = await fetch("http://127.0.0.1:5000/rooms/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setForm({ room_number: "", room_type: "", capacity: "" });
      fetchRooms();
    }
  };

  const handleEdit = (room) => {
    setEditRoom(room);
    setForm({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/rooms/edit/${editRoom.room_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditRoom(null);
      setForm({ room_number: "", room_type: "", capacity: "" });
      fetchRooms();
    }
  };

  const handleDelete = async (room_id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/rooms/delete/${room_id}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchRooms();
      fetchAllotments();
    }
  };

  const handleAllotmentSave = async () => {
    setError("");
    const response = await fetch("http://127.0.0.1:5000/room_allotment/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allotmentForm),
    });
    const data = await response.json();

    if (data.status === "success") {
      setShowAllotmentForm(false);
      setAllotmentForm({
        student_id: "",
        room_id: "",
        allotment_date: new Date().toISOString().split("T")[0],
      });
      fetchRooms();
      fetchStudents();
      fetchAllotments();
    } else if (data.message) {
      setError(data.message);
    }
  };

  const handleRemoveAllotment = async (allotmentId) => {
    if (!window.confirm("Remove this room allotment?")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/room_allotment/delete/${allotmentId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchRooms();
      fetchStudents();
      fetchAllotments();
    }
  };

  const availableStudents = students.filter((student) => !student.room_number);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Rooms</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowAllotmentForm(false);
              setShowForm(!showForm);
              setEditRoom(null);
              setForm({ room_number: "", room_type: "", capacity: "" });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showForm ? "Cancel" : "Add Room"}
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setError("");
              setShowAllotmentForm(!showAllotmentForm);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showAllotmentForm ? "Cancel" : "Allot Student"}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editRoom ? "Edit Room" : "New Room"}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Room Number</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Room Type</label>
              <select
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select type</option>
                <option value="Single">Single</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Capacity</label>
              <input
                type="number"
                placeholder="e.g. 2"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <button
            onClick={editRoom ? handleUpdate : handleAdd}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editRoom ? "Update Room" : "Save Room"}
          </button>
        </div>
      )}

      {showAllotmentForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Allotment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Student</label>
              <select
                value={allotmentForm.student_id}
                onChange={(e) => setAllotmentForm({ ...allotmentForm, student_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <option value="">Select student</option>
                {availableStudents.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name} ({student.room_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Room</label>
              <select
                value={allotmentForm.room_id}
                onChange={(e) => setAllotmentForm({ ...allotmentForm, room_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.room_number} ({room.room_type}) - {room.occupied_count}/{room.capacity}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Allotment Date</label>
              <input
                type="date"
                value={allotmentForm.allotment_date}
                onChange={(e) => setAllotmentForm({ ...allotmentForm, allotment_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <button
            onClick={handleAllotmentSave}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Save Allotment
          </button>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Room ID</th>
              <th className="pb-3 text-gray-500 font-medium">Room Number</th>
              <th className="pb-3 text-gray-500 font-medium">Room Type</th>
              <th className="pb-3 text-gray-500 font-medium">Capacity</th>
              <th className="pb-3 text-gray-500 font-medium">Occupied</th>
              <th className="pb-3 text-gray-500 font-medium">Allotted To</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-6">
                  No rooms found
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.room_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{room.room_id}</td>
                  <td className="py-3 text-gray-600">{room.room_number}</td>
                  <td className="py-3 text-gray-600">{room.room_type}</td>
                  <td className="py-3 text-gray-600">{room.capacity}</td>
                  <td className="py-3 text-gray-600">{room.occupied_count}</td>
                  <td className="py-3 text-gray-600">
                    {room.allotted_students ? room.allotted_students : "Not Allotted"}
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.room_id)}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Allotments</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Student</th>
              <th className="pb-3 text-gray-500 font-medium">Preferred Type</th>
              <th className="pb-3 text-gray-500 font-medium">Room</th>
              <th className="pb-3 text-gray-500 font-medium">Room Type</th>
              <th className="pb-3 text-gray-500 font-medium">Date</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allotments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-6">
                  No active allotments found
                </td>
              </tr>
            ) : (
              allotments.map((allotment) => (
                <tr key={allotment.allotment_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{allotment.student_name}</td>
                  <td className="py-3 text-gray-600">{allotment.preferred_room_type}</td>
                  <td className="py-3 text-gray-600">{allotment.room_number}</td>
                  <td className="py-3 text-gray-600">{allotment.room_type}</td>
                  <td className="py-3 text-gray-600">{allotment.allotment_date}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleRemoveAllotment(allotment.allotment_id)}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Remove
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

export default Rooms;
