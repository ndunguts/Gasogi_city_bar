import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const showCheckbox = location.state?.fromorderview || false;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkboxValue, setCheckboxValue] = useState(null);
  const [error, setError] = useState(null);

  // Fata user uri logged in muri localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Access control: niba user atari logged in cyangwa status atari Manager/Boss
    if (!user || !["Manager", "Boss"].includes(user.status)) {
      navigate("/"); // subira kuri home page
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://13.60.231.199/api/orders/${id}/`);
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
      await axios.patch(`http://13.60.231.199/api/orders/${id}/`, {
        confirm: value,
      });
      setOrder((prev) => ({ ...prev, confirm: value }));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Habaye ikibazo mu kubika changes.");
      setCheckboxValue(order.confirm || null);
    }
  };

  if (!user || !["Manager", "Boss"].includes(user.status)) return null;
  if (loading) return <p className="p-6 text-gray-600">Loading order...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📦 Order #{order.id}</h2>

      {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

      <div className="bg-white shadow-md rounded-2xl p-4 mb-6">
        <p><strong>Customer:</strong> {order.customer_name}</p>
        <p><strong>Phone:</strong> {order.customer_phone}</p>
        <p><strong>Delivery:</strong> {order.delivery_method}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Note:</strong> {order.note || "No note"}</p>
        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

        {showCheckbox && (
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={checkboxValue === "ok"}
                onChange={handleCheckboxChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Confirm Order</span>
            </label>
          </div>
        )}
      </div>

      <div className="overflow-x-auto shadow-lg rounded-2xl mb-4">
        <table className="min-w-full bg-white border border-gray-200 rounded-2xl">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {order.items.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="py-3 px-4">{item.product_name}</td>
                <td className="py-3 px-4">{item.quantity}</td>
                <td className="py-3 px-4">{item.price} RWF</td>
                <td className="py-3 px-4 font-semibold">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} RWF
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <p className="text-lg font-bold text-gray-800">
          Total: {order.total} RWF
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-black px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
