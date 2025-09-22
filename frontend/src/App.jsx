import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import OrderForm from './components/OrderForm'
import Orderview from './components/Orderview'
import Orderdate from './components/Orderdate'
import Orderdatail from './components/Orderdatail'
import EmployeesTable from './components/EmployeesTable'
import EmployeeOrders from "./components/EmployeeOrders";
import MyOrder from "./components/MyOrder";
import ConfirmPay from "./components/ConfirmPay";
import Login from './pages/Login'

import { CartProvider, useCart } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Navbar items component
function NavbarItems() {
  const { cartItems } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <div className="header_bar">
      {/* Cart link */}
      <Link to="/cart" className="link">
        🛒 Igikapu ({cartItems.length})
      </Link>

      {/* Order / Save link */}
      {location.pathname === "/cart" && cartItems.length > 0 && (
        <>
          {!user ? (
            <Link to="/order" className="link">
              📦 Ohereza Order ({cartItems.length})
            </Link>
          ) : (
            <Link to="/order" className="link">  
              📦 Kugurisha ({cartItems.length})
            </Link>
          )}
        </>
      )}

      {/* Extra menu by role */}
      {user && (
        <>
          <Link to="/myorder" className="link">
            MyOrder
          </Link>

          {user.status === "Manager" && (
            <>
              <Link to="/orderview" className="link">
                Views_Order
              </Link>
              <Link to="/employees" className="link">
                Employees
              </Link>
            </>
          )}

          {user.status === "Boss" && (
            <>
              <Link to="/orderview" className="link">
                Views_Order
              </Link>
              <Link to="/employees" className="link">
                Employees
              </Link>
              <Link to="/orderdate" className="link">
                ⚙️ Setting
              </Link>
            </>
          )}
        </>
      )}

      {/* Login / Logout */}
      {user ? (
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
        >
          🔓 Logout ({user.name || user.phone})
        </button>
      ) : (
        <Link
          to="/login"
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
        >
          🔑 Kwinjira
        </Link>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            {/* Navbar */}
            <div className="w-full bg-white shadow-md">
              <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-xl font-bold text-blue-700">
                  <Link to="/" className='head-logo'>Gasogi city bar</Link>
                </h1>
                <NavbarItems />
              </div>
            </div>

            {/* Routes Content */}
            <div className="container mx-auto p-4 mt-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order" element={<OrderForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/orderview" element={<Orderview />} />
                <Route path="/orders/:id" element={<Orderdatail />} />
                <Route path="/orderdate" element={<Orderdate />} />
                <Route path="/employees" element={<EmployeesTable />} />
                <Route path="/employee/:employeeSlug/orders" element={<EmployeeOrders />}/>
                <Route path="/myorder" element={<MyOrder />} /> 
                <Route path="/confirmpay/:id" element={<ConfirmPay />} />
                {/* Boss only settings */}
                <Route path="/settings" element={<div>⚙️ Settings page</div>} /> 
              </Routes>
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
