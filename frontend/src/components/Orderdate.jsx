import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersByDate() {
  const navigate = useNavigate();

  // Fata user uri logged in muri localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.status !== "Boss") {
      navigate("/"); // subira kuri home page niba atari Boss
    }
  }, [navigate, user]);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [productSummary, setProductSummary] = useState([]);
  const [aiProducts, setAiProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await axios.get("http://13.60.231.199/api/orders_by_date/", {
        params: { date: selectedDate },
      });

      const confirmedOrders = res.data.orders.filter(order => order.confirm === "ok");
      setOrders(confirmedOrders);

      const totalAmount = confirmedOrders.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
      );
      setTotal(totalAmount);

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

      setProductSummary(res.data.products || []);

      const aiRes = await axios.get("http://13.60.231.199/api/orders_with_ai/", {
        params: { date: selectedDate }
      });
      setAiProducts(aiRes.data.products || []);

    } catch (err) {
      console.error("Error fetching orders by date:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!date) return;
    fetchOrders(date);
    const interval = setInterval(() => fetchOrders(date), 5000);
    return () => clearInterval(interval);
  }, [date]);

  if (!user || user.status !== "Boss") return null;

  const Table = ({ headers, rows }) => (
    <div className="overflow-x-auto">
      <table className="w-full border bg-white shadow rounded-lg text-xs sm:text-sm table-auto">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-2 py-1 sm:px-3 sm:py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 transition">
              {headers.map((h, i) => (
                <td key={i} className="px-2 py-1 sm:px-3 sm:py-2 truncate">{row[h]}</td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-2 text-gray-500 italic">
                Nta data yabonetse
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 max-w-screen-lg mx-auto relative">
      {/* Full-screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-2"></div>
            <p className="text-blue-700 font-semibold text-lg">Loading data...</p>
          </div>
        </div>
      )}

      <h2 className="text-lg sm:text-2xl font-bold mb-4">📅 Report ya Business (Boss View)</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Hitamo tariki: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-sm focus:ring focus:ring-blue-300 text-xs sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Orders Table */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">📝 Orders</h3>
          <Table
            headers={["Customer", "Delivery Method", "Total", "Created At", "Action"]}
            rows={orders.map(o => ({
              Customer: o.customer_name,
              "Delivery Method": o.delivery_method,
              Total: `${o.total} RWF`,
              "Created At": new Date(o.created_at).toLocaleString(),
              Action: <Link to={`/orders/${o.id}`} className="bg-blue-500 text-black px-2 py-1 rounded text-xs hover:bg-blue-600 transition">View</Link>
            }))}
          />
          <h3 className="text-sm sm:text-base font-bold mt-2">
            Total y’amafaranga: <span className="text-green-700">{total} RWF</span>
          </h3>
        </div>

        {/* Customer Summary */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">👥 Customer Summary</h3>
          <Table
            headers={["Customer", "Inshuro", "Total"]}
            rows={customerSummary.map(c => ({
              Customer: c.customer_name,
              Inshuro: c.count,
              Total: `${c.total} RWF`
            }))}
          />
        </div>

        {/* Product Summary */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">📦 Products Summary</h3>
          <Table
            headers={["Product", "Quantity", "Unit Cost", "Total Cost", "Unit Sell", "Total Sales", "Profit"]}
            rows={productSummary.map(p => ({
              Product: p.product__name,
              Quantity: p.total_quantity,
              "Unit Cost": p.unit_buy,
              "Total Cost": p.total_cost,
              "Unit Sell": p.unit_sell,
              "Total Sales": `${p.total_sales} RWF`,
              Profit: `${p.profit} RWF`
            }))}
          />
        </div>

        {/* AI Recommendations */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">🤖 AI Recommendations</h3>
          <Table
            headers={["Product", "Quantity Sold", "Total Sales", "Recommendation"]}
            rows={aiProducts.map(a => ({
              Product: a.product,
              "Quantity Sold": a.quantity_sold,
              "Total Sales": `${a.total_sales} RWF`,
              Recommendation: a.recommendation
            }))}
          />
        </div>

      </div>
    </div>
  );
}
