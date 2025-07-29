"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔐 Attempting login for:", email)

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Server tidak dapat diakses. Pastikan backend berjalan di http://localhost:5000")
        }

        const errorData = await response.json().catch(() => ({ message: "Server error" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Login successful:", data)

      // Simpan token dan info user dengan urutan yang benar
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      localStorage.setItem("isLoggedIn", "true")

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      // Tunggu sebentar untuk memastikan localStorage ter-set
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Redirect berdasarkan role
      if (data.role === "sales") {
        navigate("/dashboardSales", { replace: true })
      } else if (data.role === "admin" || data.role === "superadmin") {
        navigate("/dashboardAdmin", { replace: true })
      } else {
        throw new Error("Role tidak dikenali")
      }
    } catch (err: any) {
      console.error("❌ Login error:", err)
      setError(err.message || "Gagal login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-200 to-blue-100 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <a href="#" className="inline-block">
            <img
              src="https://upload.wikimedia.org/wikipedia/id/thumb/c/c4/Telkom_Indonesia_2013.svg/1200px-Telkom_Indonesia_2013.svg.png"
              alt="Telkom Indonesia"
              className="h-12 transition-transform hover:scale-105"
            />
          </a>
        </div>
      </nav>

      {/* Login Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-1">Login</h2>
          <p className="text-sm text-center text-gray-600 mb-6">Masuk ke akun Anda</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                placeholder="Masukkan email Anda"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                placeholder="Masukkan password Anda"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-2 rounded-md transition-all shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">atau</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="text-center">
            <p className="text-balance text-gray-900 mb-1">Silahkan menghubungi admin jika ingin membuat akun</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login