import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext" // <<<< shyiraho

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()  // <<< hook ya context

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !password) {
      setError("unzuzamo email na password byose.")
      return
    }

    try {
      const res = await axios.get("http://16.171.195.132/api/abakozi/")
      const abakoziList = res.data
      const user = abakoziList.find(
        (u) => u.email_u === email && u.phone_u === password
      )

      if (user) {
        login(user) // <<< shyira user muri context
        setSuccess("✅ Login successful!")
        setTimeout(() => {
          navigate("/")
        }, 1000)
      } else {
        setError("❌ Invalid credentials")
      }
    } catch (err) {
      setError("❌ Habaye ikosa kuri server")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">🔑 Kwinjira</h2>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="input">
            <label className="mb-1 text-gray-700 font-medium">Email : </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-login-email"
              placeholder="Injiza email"
            />
          </div>

          <div className="input">
            <label className="mb-1 text-gray-700 font-medium">Password :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-login-pass"
              placeholder="Injiza password"
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          <button
            type="submit"
            className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold mt-5 hover:bg-gray-500 transition-all duration-200"
          >
            Injira
          </button>
        </form>
      </div>
    </div>
  )
}
