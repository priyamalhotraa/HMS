import { useEffect, useState } from "react";

function Visitors() {
  const [visitors, setVisitors] = useState([]);

  const fetchVisitors = () => {
    fetch("http://127.0.0.1:5000/visitors")
      .then((res) => res.json())
      .then((data) => setVisitors(data));
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Visitors</h2>
        <p className="text-sm text-gray-500 mt-1">
          Visitor entries are shown here for the warden to monitor. This module is view-only for now.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-500 font-medium">Student</th>
              <th className="pb-3 text-gray-500 font-medium">Visitor</th>
              <th className="pb-3 text-gray-500 font-medium">Relation</th>
              <th className="pb-3 text-gray-500 font-medium">Date</th>
              <th className="pb-3 text-gray-500 font-medium">In</th>
              <th className="pb-3 text-gray-500 font-medium">Out</th>
            </tr>
          </thead>
          <tbody>
            {visitors.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-6">
                  No visitor records found
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor.visitor_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-600">{visitor.student_name}</td>
                  <td className="py-3 text-gray-600">{visitor.visitor_name}</td>
                  <td className="py-3 text-gray-600">{visitor.relation}</td>
                  <td className="py-3 text-gray-600">{visitor.visit_date}</td>
                  <td className="py-3 text-gray-600">{visitor.in_time}</td>
                  <td className="py-3 text-gray-600">{visitor.out_time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Visitors;
