"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import DashboardAdmin from "./pages/dashboardAdmin"
import Register from "./pages/register"
import DashboardSales from "./pages/dashboardSales"
import VisualisasiData from "./pages/visualisasiData"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")

      console.log("🔐 ProtectedRoute check:", { token: !!token, role, allowedRoles })

      if (!token || !role) {
        console.log("❌ No token or role found")
        setIsAuthorized(false)
      } else if (allowedRoles.includes(role)) {
        console.log("✅ Role authorized:", role)
        setIsAuthorized(true)
      } else {
        console.log("❌ Role not authorized:", role, "allowed:", allowedRoles)
        setIsAuthorized(false)
      }

      setIsChecking(false)
    }

    // Small delay to ensure localStorage is properly set
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [allowedRoles])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2">Checking authorization...</span>
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  console.log("🚀 App component rendered")

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardSales"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <DashboardSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardAdmin"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visualisasi-data"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <VisualisasiData />
            </ProtectedRoute>
          }
        />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App