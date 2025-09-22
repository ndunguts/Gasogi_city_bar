import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || (user.status !== "Manager" && user.status !== "Boss")) {
      navigate("/");
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchOrders = () => {
      axios
        .get("http://13.53.133.56/api/orders/")
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
          setLoading(false);
        });
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!user || (user.status !== "Manager" && user.status !== "Boss")) return null;
  if (loading) return <p className="p-2 text-gray-600 text-sm">Loading orders...</p>;

  const filteredOrders = orders.filter((order) => order.confirm === null);
  const totalSum = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="p-2 sm:p-4 max-w-screen-sm sm:max-w-screen-lg mx-auto">
      <h2 className="text-base sm:text-2xl font-bold mb-3 text-gray-800">
        📦 Orders zitegereje gusubizwa
      </h2>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-hidden shadow rounded-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-xs sm:text-sm table-auto">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs sm:text-sm">
            <tr>
              <th className="py-1 px-2 sm:py-2 sm:px-2 w-12 truncate">ID</th>
              <th className="py-1 px-2 sm:py-2 sm:px-2 truncate">Customer</th>
              <th className="py-1 px-2 sm:py-2 sm:px-2 truncate">Phone</th>
              <th className="py-1 px-2 sm:py-2 sm:px-2 truncate">Total</th>
              <th className="py-1 px-2 sm:py-2 sm:px-2 truncate">Status</th>
              <th className="py-1 px-2 sm:py-2 sm:px-2 truncate">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs sm:text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-1 px-2 sm:py-2 sm:px-2 font-medium truncate">{order.id}</td>
                  <td className="py-1 px-2 sm:py-2 sm:px-2 truncate">{order.customer_name}</td>
                  <td className="py-1 px-2 sm:py-2 sm:px-2 truncate">{order.customer_phone}</td>
                  <td className="py-1 px-2 sm:py-2 sm:px-2 font-semibold truncate">{order.total} RWF</td>
                  <td className="py-1 px-2 sm:py-2 sm:px-2 truncate">{order.status}</td>
                  <td className="py-1 px-2 sm:py-2 sm:px-2">
                    <Link
                      to={`/orders/${order.id}`}
                      state={{ fromorderview: true }}
                      className="bg-blue-500 text-black px-2 py-0.5 rounded text-xs hover:bg-blue-600 transition truncate block text-center"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-1 text-gray-500 italic text-xs sm:text-sm truncate">
                  Nta orders ziboneka aho confirm ari null
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-1">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-2 border border-gray-200 text-xs break-words"
            >
             
              <Link
                to={`/orders/${order.id}`}
                state={{ fromorderview: true }}
                className="mt-1 inline-block bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600 transition truncate text-center w-full"
              >
                View
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center py-2 text-gray-500 italic text-xs break-words">
            Nta orders ziboneka aho confirm ari null
          </p>
        )}
      </div>

      {/* Total Sum */}
      {filteredOrders.length > 0 && (
        <div className="mt-2 sm:mt-4 text-right text-gray-800 font-bold text-sm sm:text-base break-words">
          Igiteranyo: {totalSum} RWF
        </div>
      )}
    </div>
  );
}
