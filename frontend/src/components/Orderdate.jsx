import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersByDate() {
  const navigate = useNavigate();

  // Fata user uri logged in muri localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Access control: niba user atari logged in cyangwa status atari Boss
  useEffect(() => {
    if (!user || user.status !== "Boss") {
      navigate("/"); // subira kuri home page
    }
  }, [navigate, user]);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [productSummary, setProductSummary] = useState([]);
  const [aiProducts, setAiProducts] = useState([]);

  const fetchOrders = async (selectedDate) => {
    try {
      // Fata orders + products summary
      const res = await axios.get("http://13.60.231.199/api/orders_by_date/", {
        params: { date: selectedDate },
      });

      // Filter confirmed orders
      const confirmedOrders = res.data.orders.filter(order => order.confirm === "ok");
      setOrders(confirmedOrders);

      // Total yose
      const totalAmount = confirmedOrders.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
      );
      setTotal(totalAmount);

      // Customer summary
      const grouped = confirmedOrders.reduce((acc, order) => {
        if (!acc[order.customer_name]) acc[order.customer_name] = { count: 0, total: 0 };
        acc[order.customer_name].count += 1;
        acc[order.customer_name].total += parseFloat(order.total);
        return acc;
      }, {});

      setCustomerSummary(
        Object.keys(grouped).map(name => ({
          customer_name: name,
          count: grouped[name].count,
          total: grouped[name].total
        }))
      );

      // Product summary
      setProductSummary(res.data.products || []);

      // AI recommendations
      const aiRes = await axios.get("http://13.60.231.199/api/orders_with_ai/", {
        params: { date: selectedDate }
      });
      setAiProducts(aiRes.data.products || []);

    } catch (err) {
      console.error("Error fetching orders by date:", err);
    }
  };

  // Fetch orders on mount + date change + auto-refresh
  useEffect(() => {
    if (!date) return;
    fetchOrders(date);
    const interval = setInterval(() => fetchOrders(date), 5000);
    return () => clearInterval(interval);
  }, [date]);

  // Nta access -> return null
  if (!user || user.status !== "Boss") return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 Report ya Business (Boss View)</h2>

      {/* Date Selector */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Hitamo tariki: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <h3 className="text-xl font-bold mb-2">📝 Orders</h3>
          <table className="w-full border-3 bg-white shadow-lg rounded-xl overflow-hidden">
            <thead className="bg-blue-600 text-black">
              <tr>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Delivery Method</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 border-b last:border-none transition">
                    <td className="px-4 py-2">{order.customer_name}</td>
                    <td className="px-4 py-2">{order.delivery_method}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">{order.total} RWF</td>
                    <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      <Link
                        to={`/orders/${order.id}`}
                        className="bg-blue-500 text-black px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                    Nta orders zabonetse kuri iyi tariki
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <h3 className="text-xl font-bold mt-6">
            Total y’amafaranga: <span className="text-green-700">{total} RWF</span>
          </h3>
        </div>

        {/* Customer Summary */}
        <div className="overflow-x-auto mt-8">
          <h3 className="text-xl font-bold mb-2">👥 Customer Summary</h3>
          <table className="w-full border-3 shadow-lg rounded-xl overflow-hidden">
            <thead className="bg-green-600 text-black">
              <tr>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Inshuro</th>
                <th className="px-4 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {customerSummary.length > 0 ? (
                customerSummary.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b last:border-none transition">
                    <td className="px-4 py-2">{row.customer_name}</td>
                    <td className="px-4 py-2">{row.count}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">{row.total} RWF</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500 italic">
                    Nta summary yabonetse
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Product Summary */}
        <div className="overflow-x-auto mt-8">
          <h3 className="text-xl font-bold mb-2">📦 Products Summary</h3>
          <table className="w-full border-3 shadow-lg rounded-xl overflow-hidden">
            <thead className="bg-yellow-500 text-black">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Unit Cost</th>
                <th className="px-4 py-2 text-left">Total Cost</th>
                <th className="px-4 py-2 text-left">Unit Sell</th>
                <th className="px-4 py-2 text-left">Total Sales</th>
                <th className="px-4 py-2 text-left">Profit</th>
              </tr>
            </thead>
            <tbody>
              {productSummary.length > 0 ? (
                productSummary.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b last:border-none transition">
                    <td className="px-4 py-2">{row.product__name}</td>
                    <td className="px-4 py-2">{row.total_quantity}</td>
                    <td className="px-4 py-2">{row.unit_buy}</td>
                    <td className="px-4 py-2">{row.total_cost}</td>
                    <td className="px-4 py-2">{row.unit_sell}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{row.total_sales} RWF</td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">{row.profit} RWF</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500 italic">
                    Nta products zagurishijwe kuri iyi tariki
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* AI Recommendation */}
        <div className="overflow-x-auto mt-8">
          <h3 className="text-xl font-bold mb-2">🤖 AI Product Recommendations</h3>
          <table className="w-full border-3 shadow-lg rounded-xl overflow-hidden">
            <thead className="bg-purple-500 text-black">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Quantity Sold</th>
                <th className="px-4 py-2 text-left">Total Sales</th>
                <th className="px-4 py-2 text-left">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {aiProducts.length > 0 ? (
                aiProducts.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b last:border-none transition">
                    <td className="px-4 py-2">{row.product}</td>
                    <td className="px-4 py-2">{row.quantity_sold}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{row.total_sales} RWF</td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">{row.recommendation}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 italic">
                    Nta recommendations zibonetse kuri iyi tariki
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
