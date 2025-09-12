import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // 👈 ongera iyi

export default function EmployeeOrders() {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 fata user muri context

  const [orders, setOrders] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🚨 Access control
  useEffect(() => {
    if (!user || (user.status !== "Manager" && user.status !== "Boss")) {
      navigate("/"); // redirect kuri home niba atemewe
    }
  }, [user, navigate]);

  useEffect(() => {
    setLoading(true);
    setError("");

    // Fata orders z'umukozi
    axios
      .get(`http://16.171.195.132/api/employee/${employeeSlug}/orders/`)
      .then((res) => {
        const filtered = res.data.filter(
          (order) => !order.confirm_money || order.confirm_money === "null"
        );
        setOrders(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError("Ntibyakunze gufata orders z’uyu mukozi!");
      });

    // Fata amakuru y'umukozi
    axios
      .get(`http://16.171.195.132/api/abakozi/${employeeSlug}/`)
      .then((res) => setEmployee(res.data))
      .catch((err) => {
        console.error(err);
        setError("Ntibyakunze gufata amakuru y’umukozi!");
      })
      .finally(() => setLoading(false));
  }, [employeeSlug]);

  return (
    <div className="p-4">
      <Link to="/employees" className="text-blue-600 hover:underline">
        ← Subira ku bakozi
      </Link>

      <h2 className="text-xl font-bold mb-4">
        Orders z’umukozi Atarishyura :
        {employee ? `${employee.name_f} ${employee.name_l}` : employeeSlug}
      </h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Total Money</th>
            <th className="border p-2">Ubwishyu</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                Nta orders zitarafite confirmation
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="border p-2">{order.total}</td>
                <td className="border p-2">
                  <Link
                    to={`/confirmpay/${order.id}`}
                    state={{ fromorderview: true }}
                    className="bg-blue-500 text-black px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
