import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || (user.status !== "Manager" && user.status !== "Boss")) {
      navigate("/");
      return;
    }

    setLoading(true);
    axios
      .get("http://13.53.133.56/api/abakozi/")
      .then((res) => setEmployees(res.data))
      .catch((err) => {
        console.error(err);
        setError("Ntibyakunze gufata abakozi!");
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleViewOrders = (employeeId) => {
    if (!employeeId) {
      alert("Id y'uyu mukozi ntabwo yabonetse!");
      return;
    }
    navigate(`/employee/${employeeId}/orders`);
  };

  return (
    <div className="max-w-screen-lg mx-auto p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Urutonde rw’Abakozi</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">First Name</th>
                <th className="border p-2 text-left">Last Name</th>
                <th className="border p-2 text-left">Phone</th>
                <th className="border p-2 text-left">Orders</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="border p-2 truncate">{emp.name_f}</td>
                  <td className="border p-2 truncate">{emp.name_l}</td>
                  <td className="border p-2 truncate">{emp.phone_u}</td>
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
        </div>
      ) : !loading && <p className="text-gray-600 mt-2">Nta bakozi babonetse.</p>}
    </div>
  );
}
