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
        const res = await axios.get("http://16.171.195.132/api/orders/", {
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
  if (loading) return <p className="p-4 text-gray-600">Loading orders...</p>;

  const totalSum = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="p-3 sm:p-6 max-w-screen-sm sm:max-w-screen-md mx-auto">
      {/* User info na Logout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 text-sm sm:text-base">
        <div>
          <p className="font-semibold text-gray-700">
            User: {user?.name_f} {user?.name_l}
          </p>
          <p className="text-gray-500">ID: {user?.id}</p>
        </div>
       
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
        📦 Orders zitegereje kwishyurwa
      </h2>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs sm:text-sm">
            <tr>
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Customer</th>
              <th className="py-2 px-2">Phone</th>
              <th className="py-2 px-2">Total</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs sm:text-sm">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-1 px-2 font-medium">{order.id}</td>
                  <td className="py-1 px-2">{order.customer_name}</td>
                  <td className="py-1 px-2">{order.customer_phone}</td>
                  <td className="py-1 px-2 font-semibold">{order.total} RWF</td>
                  <td className="py-1 px-2">{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-2 text-gray-500 italic text-xs sm:text-sm">
                  Nta orders ziboneka aho confirm ari null
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-2">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-2 flex flex-col gap-1 border border-gray-200 text-xs"
            >
             
            </div>
          ))
        ) : (
          <p className="text-center py-2 text-gray-500 italic text-xs">
            Nta orders ziboneka aho confirm ari null
          </p>
        )}
      </div>

      <div className="mt-3 text-right text-gray-800 font-bold text-sm sm:text-base">
        Igiteranyo: {totalSum} RWF
      </div>
    </div>
  );
}
