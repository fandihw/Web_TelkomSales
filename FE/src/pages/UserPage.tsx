"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Search, ChevronDown, LogOut, Home, BarChart3, Users, Trash2, Plus, X, AlertTriangle, Trash, TrashIcon, PlusCircle, PlusSquare, UserCheck, User, UserSearch, UserPlus2Icon } from 'lucide-react'
import { useNavigate } from "react-router-dom"

interface User {
  _id: string
  name: string
  email: string
  role: string
  telegram_id?: string
  createdAt?: string
  updatedAt?: string
}

const UsersPage = () => {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [filterRole, setFilterRole] = useState("")
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const roleDropdownRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 10

  // User info
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    role: "Administrator",
  })

  // State untuk data management
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State untuk delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Check authorization
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    const role = localStorage.getItem("role")

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser({
          name: user.name || "Admin",
          role: role === "superadmin" ? "Super Admin" : "Admin",
        })
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [])

  // Fetch users dari API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token tidak ditemukan")
      }

      console.log("👥 Fetching users...")

      const response = await fetch("http://localhost:5000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Users fetched:", result.length, "users")

      setUsers(result)
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil data user"
      setError(errorMessage)
      console.error("❌ Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      setDeleting(true)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token tidak ditemukan")
      }

      console.log("🗑️ Deleting user:", userId)

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      console.log("✅ User deleted successfully")

      // Refresh users list
      await fetchUsers()
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err: any) {
      console.error("❌ Error deleting user:", err)
      alert(`Gagal menghapus user: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // useEffect untuk fetch data saat komponen dimount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    navigate("/login")
  }

  // Navigate functions
  const handleBackToDashboard = () => {
    navigate("/dashboardAdmin")
  }

  const handleRegisterClick = () => {
    navigate("/register")
  }

  const handleVisualisasiClick = () => {
    navigate("/visualisasi-data")
  }

  const handleAddUser = () => {
    navigate("/register")
  }

  // Handle delete confirmation
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete._id)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !filterRole || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredUsers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRoleChange = (role: string) => {
    setFilterRole(role)
    setShowRoleDropdown(false)
  }

  const clearFilters = () => {
    setFilterRole("")
    setSearchTerm("")
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      superadmin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      sales: "bg-green-100 text-green-800",
    }
    return badges[role] || "bg-gray-100 text-gray-800"
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      superadmin: "Super Admin",
      admin: "Admin",
      sales: "Sales",
    }
    return labels[role] || role
  }

  const activeFiltersCount = [filterRole].filter(Boolean).length

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <img
                src="https://upload.wikimedia.org/wikipedia/id/thumb/c/c4/Telkom_Indonesia_2013.svg/1200px-Telkom_Indonesia_2013.svg.png"
                alt="Telkom Indonesia"
                className="h-12 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={handleBackToDashboard}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Home size={20} />
            {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <UserSearch size={20} />
            {!sidebarCollapsed && <span className="font-medium">User</span>}
          </button>

          <button
            onClick={handleRegisterClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UserPlus2Icon size={20} />
            {!sidebarCollapsed && <span className="font-medium">Register Akun</span>}
          </button>

          <button
            onClick={handleVisualisasiClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BarChart3 size={20} />
            {!sidebarCollapsed && <span className="font-medium">Visualisasi Data</span>}
          </button>
        </nav>

        {/* User Info with Dropdown */}
        <div className="p-4 border-t border-gray-200 relative" ref={dropdownRef}>
          <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-full flex items-center justify-between space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium">{currentUser.name.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsed state - just show logout icon */}
          {sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
              <p className="text-sm text-gray-600">Kelola akun pengguna sistem</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddUser}
                className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-white border border-red-700 rounded-md hover:bg-red-100 transition-colors"
                disabled={loading}
              >
                <Plus size={16} />
                <span>Tambah User</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Memuat data user...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-red-600 mr-2 mt-1">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-medium">Gagal memuat data user</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <div className="mt-3 space-x-2">
                    <button onClick={fetchUsers} className="text-sm text-red-600 hover:text-red-800 underline">
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show content only when not loading and no error */}
          {!loading && !error && (
            <>
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Cari nama, email, atau role..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Role Filter */}
                    <div className="relative" ref={roleDropdownRef}>
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                          filterRole ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300"
                        }`}
                      >
                        <span>{filterRole ? getRoleLabel(filterRole) : "Semua Role"}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${showRoleDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showRoleDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleRoleChange("")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              Semua Role
                            </button>
                            <button
                              onClick={() => handleRoleChange("superadmin")}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                filterRole === "superadmin" ? "bg-red-50 text-red-700" : ""
                              }`}
                            >
                              Super Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange("admin")}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                filterRole === "admin" ? "bg-red-50 text-red-700" : ""
                              }`}
                            >
                              Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange("sales")}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                filterRole === "sales" ? "bg-red-50 text-red-700" : ""
                              }`}
                            >
                              Sales
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Clear Filters Button */}
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        <span className="text-sm">Clear ({activeFiltersCount})</span>
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length}{" "}
                    user
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Filter aktif:</span>
                    {filterRole && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Role: {getRoleLabel(filterRole)}
                        <button
                          onClick={() => setFilterRole("")}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Telegram ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Tanggal Dibuat
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.length > 0 ? (
                        currentData.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                                  user.role
                                )}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.telegram_id || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.createdAt 
                                ? new Date(user.createdAt).toLocaleDateString("id-ID")
                                : "-"
                              }
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Hapus User"
                              >
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            {filteredUsers.length === 0 && users.length > 0
                              ? "Tidak ada user yang sesuai dengan filter"
                              : "Belum ada user terdaftar"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{" "}
                          <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> dari{" "}
                          <span className="font-medium">{filteredUsers.length}</span> hasil
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? "z-10 bg-red-50 border-red-500 text-red-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus User</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus user berikut?
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Nama: {userToDelete.name}</p>
                    <p className="text-sm text-gray-600">Email: {userToDelete.email}</p>
                    <p className="text-sm text-gray-600">Role: {getRoleLabel(userToDelete.role)}</p>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan!
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menghapus...
                      </div>
                    ) : (
                      "Hapus User"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage