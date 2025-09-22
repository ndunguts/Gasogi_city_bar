import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersByDate() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.status !== "Boss") navigate("/");
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
      const res = await axios.get(
        "http://13.53.133.56/api/orders_by_date/",
        { params: { date: selectedDate } }
      );
      const confirmedOrders = res.data.orders.filter((o) => o.confirm === "ok");
      setOrders(confirmedOrders);
      setTotal(
        confirmedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0)
      );

      const grouped = confirmedOrders.reduce((acc, o) => {
        if (!acc[o.customer_name]) acc[o.customer_name] = { count: 0, total: 0 };
        acc[o.customer_name].count += 1;
        acc[o.customer_name].total += parseFloat(o.total);
        return acc;
      }, {});
      setCustomerSummary(
        Object.keys(grouped).map((name) => ({
          customer_name: name,
          count: grouped[name].count,
          total: grouped[name].total,
        }))
      );

      setProductSummary(res.data.products || []);

      const aiRes = await axios.get(
        "http://13.53.133.56/api/orders_with_ai/",
        { params: { date: selectedDate } }
      );
      setAiProducts(aiRes.data.products || []);
    } catch (err) {
      console.error(err);
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
      {/* Desktop Table */}
      <table className="hidden sm:table min-w-full border bg-white text-[10px] sm:text-xs table-auto rounded-lg shadow-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-1 py-1 text-left whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {headers.map((h, i) => (
                  <td key={i} className="px-1 py-0.5 truncate">
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-1 text-gray-500 italic">
                Nta data yabonetse
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-1">
        {rows.length > 0 ? (
          rows.map((row, idx) => (
            <div key={idx} className="border rounded p-2 bg-white shadow-sm">
              {headers.map((h, i) => (
                <div key={i} className="flex justify-between text-[10px] sm:text-xs mb-0.5">
                  <span className="font-semibold text-gray-600">{h}:</span>
                  <span className="text-gray-800 break-words">{row[h]}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 italic text-[10px]">Nta data yabonetse</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 max-w-screen-lg mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600 mb-1"></div>
            <p className="text-blue-700 font-semibold text-xs sm:text-sm">Loading data...</p>
          </div>
        </div>
      )}

      <h2 className="text-sm sm:text-base font-bold mb-2">📅 Report ya Business (Boss View)</h2>

      <div className="mb-2">
        <label className="mr-1 text-[10px] sm:text-xs font-medium">Hitamo tariki:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-1 py-0.5 text-[10px] sm:text-xs w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {/* Orders */}
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold mb-1">📝 Orders</h3>
          <Table
            headers={["Customer",  "Total", "Created At", "Action"]}
            rows={orders.map((o) => ({
              Customer: o.customer_name,
              
              Total: `${o.total} RWF`,
              "Created At": new Date(o.created_at).toLocaleString(),
              Action: (
                <Link
                  to={`/orders/${o.id}`}
                  className="bg-blue-500 text-black px-1 py-0.5 rounded text-[9px] hover:bg-blue-600 transition"
                >
                  View
                </Link>
              ),
            }))}
          />
          <h3 className="text-[10px] sm:text-xs font-bold mt-1">
            Total: <span className="text-green-700">{total} RWF</span>
          </h3>
        </div>

        {/* Customer Summary */}
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold mb-1">👥 Customer Summary</h3>
          <Table
            headers={["Customer", "Inshuro", "Total"]}
            rows={customerSummary.map((c) => ({
              Customer: c.customer_name,
              Inshuro: c.count,
              Total: `${c.total} RWF`,
            }))}
          />
        </div>

        {/* Product Summary */}
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold mb-1">📦 Products Summary</h3>
          <Table
            headers={["Product", "Quantity", "Unit Cost", "Total Cost", "Unit Sell", "Total Sales", "Profit"]}
            rows={productSummary.map((p) => ({
              Product: p.product__name,
              Quantity: p.total_quantity,
              "Unit Cost": p.unit_buy,
              "Total Cost": p.total_cost,
              "Unit Sell": p.unit_sell,
              "Total Sales": `${p.total_sales} RWF`,
              Profit: `${p.profit} RWF`,
            }))}
          />
        </div>

        {/* AI Recommendations */}
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold mb-1">🤖 AI Recommendations</h3>
          <Table
            headers={["Product", "Quantity Sold", "Total Sales", "Recommendation"]}
            rows={aiProducts.map((a) => ({
              Product: a.product,
              "Quantity Sold": a.quantity_sold,
              "Total Sales": `${a.total_sales} RWF`,
              Recommendation: a.recommendation,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
