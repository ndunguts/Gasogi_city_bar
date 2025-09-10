import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // import AuthContext

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // get logged-in user

  useEffect(() => {
    // Access control: gusa Manager cyangwa Boss
    if (!user || (user.status !== "Manager" && user.status !== "Boss")) {
      navigate("/"); // subira kuri home niba atari Manager/Boss
      return;
    }

    setLoading(true);
    axios
      .get("http://13.60.231.199/api/abakozi/")
      .then((res) => setEmployees(res.data))
      .catch((err) => {
        console.error(err);
        setError("Ntibyakunze gufata abakozi!");
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleViewOrders = (employeeSlug) => {
    if (!employeeSlug) {
      alert("Slug y'uyu mukozi ntabwo yabonetse!");
      return;
    }
    navigate(`/employee/${employeeSlug}/orders`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Urutonde rw’Abakozi</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {employees.length > 0 ? (
        <table className="w-full border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">First Name</th>
              <th className="border p-2">Last Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Orders</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="border p-2">{emp.name_f}</td>
                <td className="border p-2">{emp.name_l}</td>
                <td className="border p-2">{emp.phone_u}</td>
                <td className="border p-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleViewOrders(emp.id)}
                  >
                    View Orders
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !loading && <p>Nta bakozi babonetse.</p>}
    </div>
  );
}
