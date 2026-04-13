import { useEffect, useState } from "react";

function OutingLeave() {
  const [outing, setOuting] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("outing");

  const fetchOuting = () => {
    fetch("http://127.0.0.1:5000/outing")
      .then((res) => res.json())
      .then((data) => setOuting(data));
  };

  const fetchLeaveRequests = () => {
    fetch("http://127.0.0.1:5000/leave_requests")
      .then((res) => res.json())
      .then((data) => setLeaveRequests(data));
  };

  useEffect(() => {
    fetchOuting();
    fetchLeaveRequests();
  }, []);

  const updateWardenOuting = async (outingId, wardenStatus) => {
    const response = await fetch(`http://127.0.0.1:5000/outing/warden/${outingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warden_status: wardenStatus }),
    });
    const data = await response.json();
    if (data.status === "success") {
      fetchOuting();
    } else if (data.message) {
      alert(data.message);
    }
  };

  const updateWardenLeave = async (leaveId, wardenStatus) => {
    const response = await fetch(`http://127.0.0.1:5000/leave_requests/warden/${leaveId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warden_status: wardenStatus }),
    });
    const data = await response.json();
    if (data.status === "success") {
      fetchLeaveRequests();
    } else if (data.message) {
      alert(data.message);
    }
  };

  const rows = activeTab === "outing" ? outing : leaveRequests;
  const pendingRows = rows.filter(
    (item) => item.parent_status === "Approved" && item.warden_status === "Pending"
  );
  const historyRows = rows.filter(
    (item) => !(item.parent_status === "Approved" && item.warden_status === "Pending")
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Outing & Leave</h2>
        <p className="text-sm text-gray-500 mt-1">
          Students submit requests, parents approve first, and only then the warden takes the final decision.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("outing")}
          className={`px-4 py-2 rounded-lg ${activeTab === "outing" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
        >
          Outing
        </button>
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 rounded-lg ${activeTab === "leave" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
        >
          Leave
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Waiting For Warden Decision</h3>
          <span className="text-sm text-gray-400">{pendingRows.length} request(s)</span>
        </div>

        {pendingRows.length === 0 ? (
          <p className="text-gray-400 text-sm">No requests are currently waiting for the warden.</p>
        ) : (
          pendingRows.map((item) => (
            <div
              key={activeTab === "outing" ? item.outing_id : item.leave_id}
              className="border-b border-gray-50 py-4 last:border-b-0 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-gray-700">{item.student_name}</p>
                <p className="text-sm text-gray-500">{item.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === "outing"
                    ? `${item.outing_date} | ${item.out_time} to ${item.in_time}`
                    : `${item.start_date} to ${item.end_date}`}
                </p>
                <p className="text-xs text-green-600 mt-1">Parent approved</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    activeTab === "outing"
                      ? updateWardenOuting(item.outing_id, "Approved")
                      : updateWardenLeave(item.leave_id, "Approved")
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    activeTab === "outing"
                      ? updateWardenOuting(item.outing_id, "Rejected")
                      : updateWardenLeave(item.leave_id, "Rejected")
                  }
                  className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Previous Records</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Student</th>
              <th className="pb-3 text-gray-500 font-medium">Reason</th>
              <th className="pb-3 text-gray-500 font-medium">Dates</th>
              <th className="pb-3 text-gray-500 font-medium">Parent</th>
              <th className="pb-3 text-gray-500 font-medium">Warden</th>
            </tr>
          </thead>
          <tbody>
            {historyRows.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-6">
                  No previous records found
                </td>
              </tr>
            ) : (
              historyRows.map((item) => (
                <tr
                  key={activeTab === "outing" ? item.outing_id : item.leave_id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 text-gray-600">{item.student_name}</td>
                  <td className="py-3 text-gray-600">{item.reason}</td>
                  <td className="py-3 text-gray-600">
                    {activeTab === "outing"
                      ? `${item.outing_date} | ${item.out_time} to ${item.in_time}`
                      : `${item.start_date} to ${item.end_date}`}
                  </td>
                  <td className="py-3 text-gray-600">{item.parent_status}</td>
                  <td className="py-3 text-gray-600">{item.warden_status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OutingLeave;
