"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Search, ChevronDown, LogOut, Home, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

const DashboardSales = () => {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Filter states
  const [filterEkosistem, setFilterEkosistem] = useState("")
  const [filterTelda, setFilterTelda] = useState("")
  const [filterSTO, setFilterSTO] = useState("")
  const [showEkosistemDropdown, setShowEkosistemDropdown] = useState(false)
  const [showTeldaDropdown, setShowTeldaDropdown] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const ekosistemDropdownRef = useRef<HTMLDivElement>(null)
  const teldaDropdownRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 10

  // Current user info
  const [currentUser, setCurrentUser] = useState({
    name: "Sales User",
    role: "Sales",
    telegram_id: null as string | null,
  })

  // Data state
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authorization and get user info
  useEffect(() => {
    const userStr = localStorage.getItem("user")

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser({
          name: user.name || "Sales User",
          role: "Sales",
          telegram_id: user.telegram_id || null,
        })
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, []) // Hapus navigate dari dependency array

  // Fetch user's data
  const fetchMyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token tidak ditemukan")
      }

      console.log("📊 Fetching my data...")

      const response = await fetch("http://localhost:5000/api/data/my-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ My data received:", result.length, "records")

      setData(result)
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil data"
      setError(errorMessage)
      console.error("❌ Error fetching my data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    fetchMyData()
  }, [])

  // Filter options
  const ekosistemOptions = [
    "Ruko",
    "Sekolah",
    "Hotel",
    "Multifinance",
    "Health",
    "Ekspedisi",
    "Energi",
    "Agriculture",
    "Properti",
    "Manufaktur",
    "Media & Communication",
  ]

  const teldaSTOMapping = {
    Bangkalan: ["SPG", "KML", "ARB", "KPP", "BKL", "OMB", "BEA", "TBU"],
    Gresik: ["CRM", "POG", "BPG", "DDS", "SDY", "KDE", "BWN", "GSK"],
    Lamongan: ["SDD", "LMG", "BBA", "BDG"],
    Pamekasan: ["BAB", "ABT", "SPK", "PRG", "AJA", "WRP", "SMP", "PME", "SPD", "MSL"],
    Tandes: ["DMO", "TNS", "KNN", "BBE", "KLN", "LKI", "KRP"],
    Ketintang: ["WRU", "IJK", "RKT", "TPO"],
    Manyar: ["GBG", "MYR", "JGR", "MGO"],
    Kanjeran: ["KPS", "PRK", "KBL", "KJR"],
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (ekosistemDropdownRef.current && !ekosistemDropdownRef.current.contains(event.target as Node)) {
        setShowEkosistemDropdown(false)
      }
      if (teldaDropdownRef.current && !teldaDropdownRef.current.contains(event.target as Node)) {
        setShowTeldaDropdown(false)
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

  // Apply filters
  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesEkosistem = !filterEkosistem || item.ekosistem === filterEkosistem
    const matchesTelda = !filterTelda || item.telda === filterTelda
    const matchesSTO = !filterSTO || item.sto === filterSTO

    return matchesSearch && matchesEkosistem && matchesTelda && matchesSTO
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle filter changes
  const handleTeldaChange = (telda: string) => {
    setFilterTelda(telda)
    setFilterSTO("") // Reset STO when Telda changes
    setShowTeldaDropdown(false)
  }

  const handleEkosistemChange = (ekosistem: string) => {
    setFilterEkosistem(ekosistem)
    setShowEkosistemDropdown(false)
  }

  const clearFilters = () => {
    setFilterEkosistem("")
    setFilterTelda("")
    setFilterSTO("")
    setSearchTerm("")
  }

  const getEkosistemBadge = (ekosistem: string) => {
    const badges: Record<string, string> = {
      Ruko: "bg-blue-100 text-blue-800",
      Sekolah: "bg-yellow-100 text-yellow-800",
      Hotel: "bg-pink-100 text-pink-800",
      Multifinance: "bg-purple-100 text-purple-800",
      Health: "bg-green-100 text-green-800",
      Ekspedisi: "bg-orange-100 text-orange-800",
      Energi: "bg-red-100 text-red-800",
      Agriculture: "bg-lime-100 text-lime-800",
      Properti: "bg-cyan-100 text-cyan-800",
      Manufaktur: "bg-teal-100 text-teal-800",
      "Media & Communication": "bg-rose-100 text-rose-800",
    }
    return badges[ekosistem] || "bg-gray-100 text-gray-800"
  }

  const activeFiltersCount = [filterEkosistem, filterTelda, filterSTO].filter(Boolean).length

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
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <Home size={20} />
            {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Sales</h1>
              <p className="text-sm text-gray-600">Data kunjungan Anda</p>
            </div>
            <button
              onClick={fetchMyData}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Memuat data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-red-600 mr-2 mt-1">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-medium">Gagal memuat data</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <div className="mt-3 space-x-2">
                    <button onClick={fetchMyData} className="text-sm text-red-600 hover:text-red-800 underline">
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Telegram ID Warning */}
          {!loading && !error && !currentUser.telegram_id && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2 mt-1">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-yellow-800 font-medium">ID Telegram Belum Terdaftar</h3>
                  <p className="text-yellow-600 text-sm mt-1">
                    Akun Anda belum memiliki ID Telegram. Hubungi admin untuk menambahkan ID Telegram agar dapat melihat
                    data dari bot.
                  </p>
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
                        placeholder="Cari data..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Ekosistem Filter */}
                    <div className="relative" ref={ekosistemDropdownRef}>
                      <button
                        onClick={() => setShowEkosistemDropdown(!showEkosistemDropdown)}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                          filterEkosistem ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300"
                        }`}
                      >
                        <span>{filterEkosistem || "Ekosistem"}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${showEkosistemDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showEkosistemDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div className="py-1">
                            <button
                              onClick={() => handleEkosistemChange("")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              Semua Ekosistem
                            </button>
                            {ekosistemOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleEkosistemChange(option)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                  filterEkosistem === option ? "bg-red-50 text-red-700" : ""
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Telda Filter */}
                    <div className="relative" ref={teldaDropdownRef}>
                      <button
                        onClick={() => setShowTeldaDropdown(!showTeldaDropdown)}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                          filterTelda ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300"
                        }`}
                      >
                        <span>{filterTelda || "Telda"}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${showTeldaDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showTeldaDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleTeldaChange("")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              Semua Telda
                            </button>
                            {Object.keys(teldaSTOMapping).map((telda) => (
                              <div key={telda}>
                                <button
                                  onClick={() => handleTeldaChange(telda)}
                                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium ${
                                    filterTelda === telda ? "bg-red-50 text-red-700" : ""
                                  }`}
                                >
                                  {telda}
                                </button>
                                {filterTelda === telda && (
                                  <div className="bg-gray-50 border-t border-gray-100">
                                    <div className="px-4 py-2">
                                      <p className="text-xs text-gray-500 mb-2">Pilih STO:</p>
                                      <div className="grid grid-cols-2 gap-1">
                                        <button
                                          onClick={() => setFilterSTO("")}
                                          className={`text-xs px-2 py-1 rounded text-left hover:bg-white transition-colors ${
                                            !filterSTO ? "bg-white text-red-600" : "text-gray-600"
                                          }`}
                                        >
                                          Semua STO
                                        </button>
                                        {teldaSTOMapping[telda as keyof typeof teldaSTOMapping].map((sto) => (
                                          <button
                                            key={sto}
                                            onClick={() => setFilterSTO(sto)}
                                            className={`text-xs px-2 py-1 rounded text-left hover:bg-white transition-colors ${
                                              filterSTO === sto ? "bg-white text-red-600" : "text-gray-600"
                                            }`}
                                          >
                                            {sto}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
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
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length}{" "}
                    data
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Filter aktif:</span>
                    {filterEkosistem && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Ekosistem: {filterEkosistem}
                        <button
                          onClick={() => setFilterEkosistem("")}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {filterSTO && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        STO: {filterSTO}
                        <button
                          onClick={() => setFilterSTO("")}
                          className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Sales
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telda
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis Kegiatan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama POI
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alamat
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ekosistem
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visit ke
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama PIC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jabatan PIC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No HP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detail Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Abonemen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Feedback
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detail Feedback
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detail Informasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Eviden
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.length > 0 ? (
                        currentData.map((item) => (
                          <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleDateString("id-ID")
                                : item.tanggal || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.kategori || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.nama_sales || item.namaSales || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.telda || "-"}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.sto || "-"}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {item.kegiatan || item.jenisKegiatan || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.poi_name || item.namaPOI || "-"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {item.address || item.alamat || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEkosistemBadge(
                                  item.ekosistem || "",
                                )}`}
                              >
                                {item.ekosistem || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.visit_ke || item.visitKe || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.contact_name || item.namaPIC || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.contact_position || item.jabatanPIC || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.contact_phone || item.noHP || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.provider || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.provider_detail || item.detailProvider || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.cost || item.abonemen || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.feedback === "Bertemu dengan PIC/Owner/Manajemen"
                                    ? "bg-green-100 text-green-800"
                                    : item.feedback === "Tidak bertemu dengan PIC"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.feedback || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.feedback_detail === "Tertarik Berlangganan Indibiz" ||
                                  item.detailFeedback === "Tertarik Berlangganan Indibiz"
                                    ? "bg-green-100 text-green-800"
                                    : item.feedback_detail === "Tidak Tertarik Berlangganan Indibiz" ||
                                        item.detailFeedback === "Tidak Tertarik Berlangganan Indibiz"
                                      ? "bg-red-100 text-red-800"
                                      : item.feedback_detail === "Ragu-ragu atau masih dipertimbangkan" ||
                                          item.detailFeedback === "Ragu-ragu atau masih dipertimbangkan"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.feedback_detail || item.detailFeedback || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {item.detail_info || item.detailInformasi || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.photo_url || item.eviden || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={21} className="px-4 py-8 text-center text-gray-500">
                            {filteredData.length === 0 && data.length > 0
                              ? "Tidak ada data yang sesuai dengan filter"
                              : currentUser.telegram_id
                                ? "Belum ada data kunjungan dari bot Telegram"
                                : "ID Telegram belum terdaftar. Hubungi admin untuk menambahkan ID Telegram."}
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
                          <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari{" "}
                          <span className="font-medium">{filteredData.length}</span> hasil
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
      </div>
    </div>
  )
}

export default DashboardSales