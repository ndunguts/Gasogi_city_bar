import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const OrderContext = createContext()

export function useOrder() {
  return useContext(OrderContext)
}

export function OrderProvider({ children }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const placeOrder = async (orderData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Replace URL with your backend API endpoint for order creation
      const response = await axios.post('http://127.0.0.1:8000/api/orders/', orderData)
      setOrder(response.data)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Habaye ikibazo mu kohereza order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrderContext.Provider value={{ order, loading, error, success, placeOrder }}>
      {children}
    </OrderContext.Provider>
  )
}
