// components/AdminOrders.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    axios.get('http://13.60.231.199/api/orders/')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📦 Orders Zose</h1>
      {orders.map(order => (
        <div key={order.id} className="border p-4 mb-4 rounded shadow-sm">
          <p><strong>Izina:</strong> {order.customer_name}</p>
          <p><strong>Phone:</strong> {order.customer_phone}</p>
          <p><strong>Igiteranyo:</strong> {order.total} RWF</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      ))}
    </div>
  )
}
