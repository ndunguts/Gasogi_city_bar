import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    navigate("/login");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/orders/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        const userOrders = res.data.filter(
          (order) =>
            order.employees_id === String(user.id) &&
            order.confirm === "ok" &&
            order.confirm_money === null
        );

        setOrders(userOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn, navigate, user]);

  if (!isLoggedIn) return null;
  if (loading) return <p className="p-6 text-gray-600">Loading orders...</p>;

  const totalSum = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="p-6">
      {/* User info na Logout */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-semibold text-gray-700">
            User: {user?.name_f} {user?.name_l}
          </p>
          <p className="text-sm text-gray-500">ID: {user?.id}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📦 Orders zitegereje kwishyurwa
      </h2>

      <div className="overflow-x-auto shadow-lg rounded-2xl">
        <table className="min-w-full bg-white border border-gray-200 rounded-2xl">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">{order.id}</td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4">{order.customer_phone}</td>
                  <td className="py-3 px-4 font-semibold">{order.total} RWF</td>
                  <td className="py-3 px-4">{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                  Nta orders ziboneka aho confirm ari null
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <p className="text-lg font-bold text-gray-800">
          Igiteranyo: {totalSum} RWF
        </p>
      </div>
    </div>
  );
}
