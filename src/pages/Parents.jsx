import { useEffect, useState } from "react";

function Parents() {
  const [parents, setParents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editParent, setEditParent] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
  });

  const fetchParents = () => {
    fetch("http://127.0.0.1:5000/parents")
      .then((res) => res.json())
      .then((data) => setParents(data));
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const resetForm = () => {
    setShowForm(!showForm);
    setEditParent(null);
    setError("");
    setForm({
      name: "",
      phone: "",
      username: "",
      password: "",
    });
  };

  const handleSubmit = async () => {
    setError("");
    const url = editParent
      ? `http://127.0.0.1:5000/parents/edit/${editParent.parent_id}`
      : "http://127.0.0.1:5000/parents/add";
    const method = editParent ? "PUT" : "POST";
    const payload = editParent
      ? { name: form.name, phone: form.phone }
      : form;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditParent(null);
      setForm({ name: "", phone: "", username: "", password: "" });
      fetchParents();
    } else if (data.message) {
      setError(data.message);
    }
  };

  const handleEdit = (parent) => {
    setEditParent(parent);
    setShowForm(true);
    setError("");
    setForm({
      name: parent.name,
      phone: parent.phone,
      username: parent.username,
      password: "",
    });
  };

  const handleDelete = async (parentId) => {
    if (!window.confirm("Delete this parent? Linked students will lose their parent link.")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/parents/delete/${parentId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchParents();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Parents</h2>
        <button
          onClick={resetForm}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {showForm ? "Cancel" : "Add Parent"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editParent ? "Edit Parent" : "New Parent"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2"
              />
            </div>
            {!editParent && (
              <>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Password</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>
              </>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editParent ? "Update Parent" : "Save Parent"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">ID</th>
              <th className="pb-3 text-gray-500 font-medium">Name</th>
              <th className="pb-3 text-gray-500 font-medium">Phone</th>
              <th className="pb-3 text-gray-500 font-medium">Username</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-6">
                  No parents found
                </td>
              </tr>
            ) : (
              parents.map((parent) => (
                <tr key={parent.parent_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{parent.parent_id}</td>
                  <td className="py-3 text-gray-600">{parent.name}</td>
                  <td className="py-3 text-gray-600">{parent.phone}</td>
                  <td className="py-3 text-gray-600">{parent.username}</td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(parent)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(parent.parent_id)}
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

export default Parents;
