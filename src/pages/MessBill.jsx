import { useEffect, useState } from "react";

function MessBill() {
  const [students, setStudents] = useState([]);
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [form, setForm] = useState({
    student_id: "",
    month: "",
    amount: "",
    status: "Pending",
  });

  const fetchStudents = () => {
    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const fetchBills = () => {
    fetch("http://127.0.0.1:5000/mess_bill")
      .then((res) => res.json())
      .then((data) => setBills(data));
  };

  useEffect(() => {
    fetchStudents();
    fetchBills();
  }, []);

  const resetForm = () => {
    setShowForm(!showForm);
    setEditBill(null);
    setForm({
      student_id: "",
      month: "",
      amount: "",
      status: "Pending",
    });
  };

  const handleSubmit = async () => {
    const url = editBill
      ? `http://127.0.0.1:5000/mess_bill/edit/${editBill.mess_bill_id}`
      : "http://127.0.0.1:5000/mess_bill/add";
    const method = editBill ? "PUT" : "POST";
    const payload = editBill
      ? { month: form.month, amount: form.amount, status: form.status }
      : form;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.status === "success") {
      setShowForm(false);
      setEditBill(null);
      setForm({
        student_id: "",
        month: "",
        amount: "",
        status: "Pending",
      });
      fetchBills();
    }
  };

  const handleEdit = (bill) => {
    setEditBill(bill);
    setShowForm(true);
    setForm({
      student_id: bill.student_id,
      month: bill.month,
      amount: bill.amount,
      status: bill.status,
    });
  };

  const handleDelete = async (messBillId) => {
    if (!window.confirm("Delete this mess bill?")) return;
    const response = await fetch(
      `http://127.0.0.1:5000/mess_bill/delete/${messBillId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchBills();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Mess Bill</h2>
        <button
          onClick={resetForm}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          {showForm ? "Cancel" : "Add Bill"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editBill ? "Edit Mess Bill" : "New Mess Bill"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Student</label>
              <select
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                disabled={Boolean(editBill)}
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
              <label className="block text-sm text-gray-500 mb-1">Month</label>
              <input
                type="text"
                placeholder="e.g. April 2026"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Amount</label>
              <input
                type="number"
                placeholder="e.g. 3500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            {editBill ? "Update Bill" : "Save Bill"}
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
              <th className="pb-3 text-gray-500 font-medium">Month</th>
              <th className="pb-3 text-gray-500 font-medium">Amount</th>
              <th className="pb-3 text-gray-500 font-medium">Status</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-6">
                  No mess bills found
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.mess_bill_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{bill.name}</td>
                  <td className="py-3 text-gray-600">{bill.course}</td>
                  <td className="py-3 text-gray-600">{bill.semester}</td>
                  <td className="py-3 text-gray-600">{bill.month}</td>
                  <td className="py-3 text-gray-600">Rs. {bill.amount}</td>
                  <td className="py-3 text-gray-600">{bill.status}</td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(bill)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bill.mess_bill_id)}
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

export default MessBill;
