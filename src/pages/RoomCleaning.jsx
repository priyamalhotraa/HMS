import { useEffect, useState } from "react";

function RoomCleaning() {
  const [cleaning, setCleaning] = useState([]);

  const fetchCleaning = () => {
    fetch("http://127.0.0.1:5000/room_cleaning")
      .then((res) => res.json())
      .then((data) => setCleaning(data));
  };

  useEffect(() => {
    fetchCleaning();
  }, []);

  const cleaned = cleaning.filter((item) => item.status === "cleaned");
  const notCleaned = cleaning.filter((item) => item.status !== "cleaned");

  const renderCard = (item) => (
    <div key={item.cleaning_id} className="border-b border-gray-50 py-3 last:border-b-0">
      <p className="text-gray-700 font-medium">{item.student_name}</p>
      <p className="text-gray-400 text-sm">Room {item.room_number}</p>
      <p className="text-gray-400 text-sm">Updated on {item.cleaning_date}</p>
      {item.remarks && <p className="text-gray-500 text-sm mt-1">{item.remarks}</p>}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Room Cleaning</h2>
        <p className="text-sm text-gray-500 mt-1">
          Students update their own room cleaning status. The warden can monitor the latest update here.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-4">
            Cleaned ({cleaned.length})
          </h3>
          {cleaned.length === 0 ? (
            <p className="text-gray-400 text-sm">No rooms marked cleaned yet</p>
          ) : (
            cleaned.map(renderCard)
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-red-500 mb-4">
            Not Cleaned ({notCleaned.length})
          </h3>
          {notCleaned.length === 0 ? (
            <p className="text-gray-400 text-sm">No rooms currently marked not cleaned</p>
          ) : (
            notCleaned.map(renderCard)
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomCleaning;
