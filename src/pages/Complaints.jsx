import { useEffect, useState } from "react";

function Complaints() {
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = () => {
    fetch("http://127.0.0.1:5000/complaints")
      .then((res) => res.json())
      .then((data) => setComplaints(data));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateComplaintStatus = async (complaintId, status) => {
    const response = await fetch(
      `http://127.0.0.1:5000/complaints/edit/${complaintId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const data = await response.json();
    if (data.status === "success") {
      fetchComplaints();
    }
  };

  const pendingComplaints = complaints.filter((item) => item.status === "Pending");
  const closedComplaints = complaints.filter((item) => item.status !== "Pending");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Complaints</h2>
        <p className="text-sm text-gray-500 mt-1">
          Students submit complaints. The warden reviews them here and marks them resolved or denied.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Total Complaints</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{complaints.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{pendingComplaints.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-sm">Closed</p>
          <p className="text-3xl font-bold text-green-500 mt-2">{closedComplaints.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Student</th>
              <th className="pb-3 text-gray-500 font-medium">Room</th>
              <th className="pb-3 text-gray-500 font-medium">Complaint</th>
              <th className="pb-3 text-gray-500 font-medium">Status</th>
              <th className="pb-3 text-gray-500 font-medium">Date</th>
              <th className="pb-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-6">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.complaint_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{complaint.student_name}</td>
                  <td className="py-3 text-gray-600">{complaint.room_number}</td>
                  <td className="py-3 text-gray-600">{complaint.complaint_text}</td>
                  <td className="py-3 text-gray-600">{complaint.status}</td>
                  <td className="py-3 text-gray-600">{complaint.complaint_date}</td>
                  <td className="py-3 flex gap-2">
                    {complaint.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => updateComplaintStatus(complaint.complaint_id, "Resolved")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint.complaint_id, "Denied")}
                          className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Deny
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Closed</span>
                    )}
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

export default Complaints;
