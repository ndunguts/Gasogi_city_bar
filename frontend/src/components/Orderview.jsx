import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fata user uri logged in
  const user = JSON.parse(localStorage.getItem("user"));

  // Access control: niba atari Manager cyangwa Boss -> subira kuri home
  useEffect(() => {
    if (!user || (user.status !== "Manager" && user.status !== "Boss")) {
      navigate("/"); // subira kuri home page
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchOrders = () => {
      axios.get("http://13.60.231.199/api/orders/")
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          setLoading(false);
        });
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 3000); // refresh buri 3s
    return () => clearInterval(interval);
  }, []);

  if (!user || (user.status !== "Manager" && user.status !== "Boss")) return null; // ntacyo yerekana niba atari authorized
  if (loading) return <p className="p-6 text-gray-600">Loading orders...</p>;

  const filteredOrders = orders.filter(order => order.confirm === null);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📦 Orders zitegereje gusubizwa</h2>
      <div className="overflow-x-auto shadow-lg rounded-2xl">
        <table className="min-w-full bg-white border border-gray-200 rounded-2xl">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">{order.id}</td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4">{order.customer_phone}</td>
                  <td className="py-3 px-4 font-semibold">{order.total} RWF</td>
                  <td className="py-3 px-4">{order.status}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/orders/${order.id}`}
                      state={{ fromorderview: true }}
                      className="bg-blue-500 text-black px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                  Nta orders ziboneka aho confirm ari null
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
