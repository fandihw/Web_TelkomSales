"use client"

import { useState, useRef, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Download,
  BarChart3,
  Eye,
  LogOut,
  Home,
  X,
  ImageIcon,
  Loader2,
  UserSearch,
  UserPlus2Icon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const DashboardAdmin = () => {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Filter
  const [filterEkosistem, setFilterEkosistem] = useState("")
  const [filterTelda, setFilterTelda] = useState("")
  const [filterSTO, setFilterSTO] = useState("")
  const [showEkosistemDropdown, setShowEkosistemDropdown] = useState(false)
  const [showTeldaDropdown, setShowTeldaDropdown] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const ekosistemDropdownRef = useRef<HTMLDivElement>(null)
  const teldaDropdownRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 10

  // User info
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    role: "Administrator",
  })

  // meneroma data
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // foto
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [, setMatchInfo] = useState<any>(null)

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

  // Fetch data dari API
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching data from API...")

      const response = await fetch("http://localhost:5000/api/visit-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      console.log("Raw response:", result)
      let actualData = result
      if (result.data && Array.isArray(result.data)) {
        actualData = result.data
      } else if (result.meta && result.data) {
        actualData = result.data
      }
      if (!Array.isArray(actualData)) {
        console.warn("Data is not an array, converting:", actualData)
        actualData = []
      }

      console.log("Data processed:", actualData.length, "records")
      setData(actualData)
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil data"
      setError(errorMessage)
      console.error("Error fetching data:", err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mencari foto
  const fetchSpecificPhoto = async (item: any) => {
    try {
      setLoadingPhotos(true)
      setPhotoError(null)
      setMatchInfo(null)

      const telegramId = item.telegram_id || item.user_id
      const poiName = item.poi_name || item.namaPOI
      const timestamp = item.timestamp
      const photoFilename = item.photo_url || item.eviden

      console.log("Advanced photo matching for item:", {
        telegramId,
        poiName,
        timestamp,
        photoFilename,
      })

      if (!telegramId) {
        throw new Error("Telegram ID tidak tersedia untuk pencarian foto")
      }

      // endpoint photo
      const response = await fetch("http://localhost:5000/api/photo-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          poi_name: poiName,
          timestamp: timestamp,
          photo_filename: photoFilename,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("Photo match failed:", errorData)
        setMatchInfo({
          searchCriteria: errorData.searchCriteria,
          availableFiles: errorData.availableFiles,
          error: errorData.message,
        })

        throw new Error(errorData.message || "Foto tidak ditemukan")
      }

      const result = await response.json()
      console.log("Photo matched successfully:", result)

      setPhotos([result])
      setMatchInfo({
        matchReason: result.matchReason,
        searchCriteria: result.searchCriteria,
        foundFile: result.filename,
      })
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil foto"
      setPhotoError(errorMessage)
      console.error("Error fetching photo:", err)
      setPhotos([])
    } finally {
      setLoadingPhotos(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  // Navigate ke register page
  const handleRegisterClick = () => {
    const role = localStorage.getItem("role")
    if (role === "superadmin") {
      navigate("/register")
    } else {
      alert("Akses ditolak. Hanya Super Admin yang dapat mendaftarkan akun baru.")
    }
  }

  // Navigate ke visualisasi data
  const handleVisualisasiClick = () => {
    navigate("/visualisasi-data")
  }

  // Handle view photos
  const handleViewPhotos = async (item: any) => {
    setSelectedItem(item)
    setShowPhotoModal(true)
    await fetchSpecificPhoto(item)
  }

  // Apply filters
  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const matchesSearch = Object.values(item || {}).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        )

        const matchesEkosistem = !filterEkosistem || item?.ekosistem === filterEkosistem
        const matchesTelda = !filterTelda || item?.telda === filterTelda
        const matchesSTO = !filterSTO || item?.sto === filterSTO

        return matchesSearch && matchesEkosistem && matchesTelda && matchesSTO
      })
    : []

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  // Export Data
  const handleExportData = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diexport")
      return
    }

    // header kolom
    const headers = [
      "ID",
      "Tanggal",
      "Kategori",
      "Nama Sales",
      "Telda",
      "STO",
      "Jenis Kegiatan",
      "Nama POI",
      "Alamat",
      "Ekosistem",
      "Visit Ke",
      "Nama PIC",
      "Jabatan PIC",
      "No HP",
      "Provider",
      "Detail Provider",
      "Abonemen",
      "Feedback",
      "Detail Feedback",
      "Detail Informasi",
      "Eviden",
    ]

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          item.id || item._id || "",
          `"${item.timestamp ? new Date(item.timestamp).toLocaleDateString("id-ID") : item.tanggal || ""}"`,
          `"${item.kategori || ""}"`,
          `"${item.nama_sales || item.namaSales || ""}"`,
          `"${item.telda || ""}"`,
          `"${item.sto || ""}"`,
          `"${item.kegiatan || item.jenisKegiatan || ""}"`,
          `"${item.poi_name || item.namaPOI || ""}"`,
          `"${item.address || item.alamat || ""}"`,
          `"${item.ekosistem || ""}"`,
          item.visit_ke || item.visitKe || "",
          `"${item.contact_name || item.namaPIC || ""}"`,
          `"${item.contact_position || item.jabatanPIC || ""}"`,
          `"${item.contact_phone || item.noHP || ""}"`,
          `"${item.provider || ""}"`,
          `"${item.provider_detail || item.detailProvider || ""}"`,
          `"${item.cost || item.abonemen || ""}"`,
          `"${item.feedback || ""}"`,
          `"${item.feedback_detail || item.detailFeedback || ""}"`,
          `"${item.detail_info || item.detailInformasi || ""}"`,
          `"${item.photo_url || item.eviden || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)

      const currentDate = new Date().toISOString().split("T")[0]
      let filename = `data-sales-${currentDate}`

      if (filterEkosistem) filename += `-${filterEkosistem}`
      if (filterTelda) filename += `-${filterTelda}`
      if (filterSTO) filename += `-${filterSTO}`

      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`Data berhasil diexport! ${filteredData.length} record telah diunduh.`)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle filter changes
  const handleTeldaChange = (telda: string) => {
    setFilterTelda(telda)
    setFilterSTO("")
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

 /* const getMatchReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      exact_filename_match: "Exact filename match",
      partial_filename_match: "Partial filename match",
      timestamp_match: "Timestamp match",
      poi_name_match: "POI name match",
      latest_file_fallback: "Latest file (fallback)",
    }
    return reasons[reason] || reason
  } */

  const activeFiltersCount = [filterEkosistem, filterTelda, filterSTO].filter(Boolean).length

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-gray-200">
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

          <button
            onClick={() => navigate("/users")}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UserSearch size={20} />
            {!sidebarCollapsed && <span className="font-medium">User Management</span>}
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

        {/* User Info Dropdown */}
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

          {/* logout icon */}
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-sm text-gray-600">Kelola data sales dan monitoring aktivitas</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-white border border-red-700 rounded-md hover:bg-red-100 transition-colors"
                disabled={loading}
              >
                <Download size={16} />
                <span>Export Data</span>
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
                  <pre className="text-red-600 text-sm mt-1 whitespace-pre-wrap">{error}</pre>
                  <div className="mt-3 space-x-2">
                    <button onClick={fetchData} className="text-sm text-red-600 hover:text-red-800 underline">
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    {filterTelda && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Telda: {filterTelda}
                        <button
                          onClick={() => {
                            setFilterTelda("")
                            setFilterSTO("")
                          }}
                          className="ml-1 hover:bg-green-200 rounded-full p-0.5"
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
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Nama Sales
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Telda
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          STO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Jenis Kegiatan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Nama POI
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Alamat
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Ekosistem
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          Visit ke
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Nama PIC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Jabatan PIC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          No HP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Detail Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Abonemen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Feedback
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Detail Feedback
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Detail Informasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Eviden
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Aksi
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
                                      ? "bg-red-100 text-red-800"
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
                            <td
                              className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate"
                              title={item.detail_info || item.detailInformasi || "-"}
                            >
                              {item.detail_info || item.detailInformasi || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.photo_url || item.eviden || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewPhotos(item)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Lihat Foto"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={21} className="px-4 py-8 text-center text-gray-500">
                            {filteredData.length === 0 && data.length > 0
                              ? "Tidak ada data yang sesuai dengan filter"
                              : "Belum ada data tersedia"}
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

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"> {/* Ubah dari max-w-4xl ke max-w-2xl */}
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <ImageIcon className="mr-2 text-red-600" size={20} />
                  Foto Kunjungan - {selectedItem?.poi_name || selectedItem?.namaPOI || "POI"}
                </h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Item Info */}
              <div className="px-6 py-4 bg-white border-b border-gray-100">
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Nama Sales:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.nama_sales || selectedItem?.namaSales || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Tanggal:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.timestamp
                        ? new Date(selectedItem.timestamp).toLocaleDateString("id-ID")
                        : selectedItem?.tanggal || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Kategori:</span>
                    <span className="text-sm text-gray-900">{selectedItem?.kategori || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Nama POI:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.poi_name || selectedItem?.namaPOI || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Detail Provider:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.provider_detail || selectedItem?.detailProvider || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Detail Feedback:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.feedback_detail || selectedItem?.detailFeedback || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-bold text-black w-32">Detail Informasi:</span>
                    <span className="text-sm text-gray-900">
                      {selectedItem?.detail_info || selectedItem?.detailInformasi || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingPhotos && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-red-600 mb-2" size={24} />
                    <span className="text-gray-600 text-sm">Memuat foto...</span> 
                  </div>
                </div>
              )}

              {/* Photo Display */}
              {!loadingPhotos && !photoError && photos.length > 0 && (
                <div className="px-6 py-4">
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                    <img
                      src={photos[0].fullUrl || "/placeholder.svg"}
                      alt={`Foto kunjungan`}
                      className="w-full object-contain max-h-[300px]" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=400&text=Foto tidak dapat dimuat" 
                      }}
                    />
                  </div>

                  {/* Filename */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 bg-gray-50 py-1 px-2 rounded-md inline-block">
                      {photos[0].filename}
                    </p>
                  </div>
                </div>
              )}

              {/* No Photos */}
              {!loadingPhotos && !photoError && photos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12"> 
                  <div className="bg-gray-50 rounded-full p-3 mb-3"> 
                    <ImageIcon className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-700 font-medium text-sm">Tidak ada foto tersedia</p> 
                  <p className="text-xs text-gray-500 mt-1">Tidak ditemukan foto untuk kunjungan ini</p> 
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end"> 
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 text-sm text-red-700 bg-white border border-red-700 rounded-md hover:bg-red-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardAdmin