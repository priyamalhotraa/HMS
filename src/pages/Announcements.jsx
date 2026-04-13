import { useEffect, useState } from "react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [form, setForm] = useState({
    user_id: "1",
    title: "",
    message: "",
    role: "all",
  });

  const fetchAnnouncements = () => {
    fetch("http://127.0.0.1:5000/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setShowForm(!showForm);
    setEditAnnouncement(null);
    setForm({
      user_id: "1",
      title: "",
      message: "",
      role: "all",
    });
  };

  const handleSubmit = async () => {
    const url = editAnnouncement
      ? `http://127.0.0.1:5000/announcements/edit/${editAnnouncement.announcement_id}`
      : "http://127.0.0.1:5000/announcements/add";
    const method = editAnnouncement ? "PUT" : "POST";
    const payload = editAnnouncement
      ? { title: form.title, message: form.message, role: form.role }
      : form;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditAnnouncement(null);
      setForm({
        user_id: "1",
        title: "",
        message: "",
        role: "all",
      });
      fetchAnnouncements();
    }
  };

  const handleEdit = (announcement) => {
    setEditAnnouncement(announcement);
    setShowForm(true);
    setForm({
      user_id: announcement.user_id,
      title: announcement.title,
      message: announcement.message,
      role: announcement.role,
    });
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/announcements/delete/${announcementId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchAnnouncements();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Announcements</h2>
        <button
          onClick={resetForm}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {showForm ? "Cancel" : "Post Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editAnnouncement ? "Edit Announcement" : "New Announcement"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Audience</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="all">All</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Message</label>
              <textarea
                rows="4"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editAnnouncement ? "Update Announcement" : "Save Announcement"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-400">
            No announcements found
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.announcement_id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">{announcement.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Audience: {announcement.role} | Posted: {announcement.created_at}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.announcement_id)}
                    className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-4">{announcement.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Announcements;
