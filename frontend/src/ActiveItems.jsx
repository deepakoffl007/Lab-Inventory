import { useEffect, useState } from "react";

function ActiveItems() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/active")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <h2>Active Borrowed Items</h2>

      {data.map((item) => (
        <div key={item.transaction_id}>
          <p>
            {item.student_name} - {item.equipment} - {item.project_name}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ActiveItems;
