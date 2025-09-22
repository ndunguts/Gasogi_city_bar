import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "http://13.53.133.56/api/",
  withCredentials: true,
});

export default function OrderDetailPage() {
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
    setCheckboxValue(value);

    try {
      const res = await api.patch(`orders/${id}/`, { confirm: value });
      setOrder(res.data);
      setError(null);
    } catch (err) {
      console.error(err.response?.status, err.message);
      setError("Habaye ikibazo mu kubika changes.");
      setCheckboxValue(order.confirm || null);
    }
  };

  if (!user || !["Manager", "Boss"].includes(user.status)) return null;
  if (loading) return <p className="p-4 text-gray-600 text-sm">Loading order...</p>;
  if (!order) return <p className="p-4 text-red-500 text-sm">Order not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-screen-lg mx-auto bg-white shadow rounded-lg p-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          📦 Order #{order.id}
        </h1>
        <p className="text-gray-600"><strong>Customer:</strong> {order.customer_name}</p>
        <p className="text-gray-600"><strong>Phone:</strong> {order.customer_phone}</p>
        <p className="text-gray-600"><strong>Delivery:</strong> {order.delivery_method}</p>
        <p className="text-gray-600"><strong>Status:</strong> {order.status}</p>
        <p className="text-gray-600"><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p className="text-gray-600"><strong>Note:</strong> {order.note || "No note"}</p>

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

      {/* Products Table - desktop/tablet */}
      <div className="hidden sm:block max-w-screen-lg mx-auto overflow-x-auto shadow rounded-lg mb-6 bg-white">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
            <tr>
              <th className="py-2 px-3 w-1/4">Product</th>
              <th className="py-2 px-3 w-1/6">Qty</th>
              <th className="py-2 px-3 w-1/4">Price</th>
              <th className="py-2 px-3 w-1/4">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {order.items.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="py-2 px-3 truncate">{item.product_name}</td>
                <td className="py-2 px-3">{item.quantity}</td>
                <td className="py-2 px-3">{item.price} RWF</td>
                <td className="py-2 px-3 font-semibold">{(parseFloat(item.price)*item.quantity).toFixed(2)} RWF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden max-w-screen-lg mx-auto space-y-3 mb-6">
        {order.items.map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-3 text-sm">
            <p><strong>Product:</strong> {item.product_name}</p>
            <p><strong>Qty:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> {item.price} RWF</p>
            <p><strong>Subtotal:</strong> {(parseFloat(item.price)*item.quantity).toFixed(2)} RWF</p>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="max-w-screen-lg mx-auto bg-white shadow rounded-lg p-4 mb-6">
        <p className="text-gray-700 font-semibold text-sm">Total Items: {order.items.length}</p>
        <p className="text-gray-800 font-bold text-lg sm:text-xl mt-2">Total: {order.total} RWF</p>
      </div>

      {/* Back button */}
      <div className="max-w-screen-lg mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-screen-lg mx-auto mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
