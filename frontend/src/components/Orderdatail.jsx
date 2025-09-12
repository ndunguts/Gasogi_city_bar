import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Axios instance ifite baseURL na credentials
const api = axios.create({
  baseURL: "http://16.171.195.132/api/",
  withCredentials: true, // kohereza cookies/CSRF niba bikenewe
});

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const showCheckbox = location.state?.fromorderview || false;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkboxValue, setCheckboxValue] = useState(null);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || !["Manager", "Boss"].includes(user.status)) {
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.get(`orders/${id}/`);
        setOrder(res.data);
        setCheckboxValue(res.data.confirm || null);
      } catch (err) {
        console.error(err);
        setError("Habaye ikibazo mu gufata order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, user]);

  const handleCheckboxChange = async (e) => {
    const value = e.target.checked ? "ok" : null;
    setCheckboxValue(value); // ihite ihindura UI

    try {
      const res = await api.patch(`orders/${id}/`, { confirm: value });
      setOrder(res.data); // update order na server response
      setError(null);
    } catch (err) {
      console.error(err.response?.status, err.message);
      setError("Habaye ikibazo mu kubika changes.");
      // Garura agaciro ka kera niba server itakiriye
      setCheckboxValue(order.confirm || null);
    }
  };

  if (!user || !["Manager", "Boss"].includes(user.status)) return null;
  if (loading) return <p className="p-4 text-gray-600 text-sm">Loading order...</p>;
  if (!order) return <p className="p-4 text-red-500 text-sm">Order not found</p>;

  return (
    <div className="p-3 sm:p-6 max-w-screen-sm sm:max-w-3xl mx-auto">
      <h2 className="text-lg sm:text-2xl font-bold mb-3 text-gray-800">
        📦 Order #{order.id}
      </h2>

      {error && <p className="mb-3 text-red-600 font-semibold text-sm">{error}</p>}

      {/* Order Info */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-4 text-sm sm:text-base">
        <p className="truncate"><strong>Customer:</strong> {order.customer_name}</p>
        <p className="truncate"><strong>Phone:</strong> {order.customer_phone}</p>
        <p className="truncate"><strong>Delivery:</strong> {order.delivery_method}</p>
        <p className="truncate"><strong>Status:</strong> {order.status}</p>
        <p className="truncate"><strong>Note:</strong> {order.note || "No note"}</p>
        <p className="truncate"><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

        {showCheckbox && (
          <div className="mt-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={checkboxValue === "ok"}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Confirm Order</span>
            </label>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="hidden sm:block overflow-hidden shadow rounded-lg mb-4">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm table-auto">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs sm:text-sm">
            <tr>
              <th className="py-1 px-2 sm:py-2 sm:px-3 w-1/4 truncate">Product</th>
              <th className="py-1 px-2 sm:py-2 sm:px-3 w-1/6 truncate">Qty</th>
              <th className="py-1 px-2 sm:py-2 sm:px-3 w-1/4 truncate">Price</th>
              <th className="py-1 px-2 sm:py-2 sm:px-3 w-1/4 truncate">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs sm:text-sm">
            {order.items.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="py-1 px-2 sm:py-2 sm:px-3 truncate">{item.product_name}</td>
                <td className="py-1 px-2 sm:py-2 sm:px-3 truncate">{item.quantity}</td>
                <td className="py-1 px-2 sm:py-2 sm:px-3 truncate">{item.price} RWF</td>
                <td className="py-1 px-2 sm:py-2 sm:px-3 font-semibold truncate">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} RWF
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end text-sm sm:text-base font-bold text-gray-800 mb-4">
        Total: {order.total} RWF
      </div>

      <div className="mt-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
