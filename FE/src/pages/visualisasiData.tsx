"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  BarChart3,
  Calendar,
  TrendingUp,
  ChevronDown,
  Globe,
  AlertCircle,
  UserSearch,
  UserPlus2Icon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

// Type definitions
interface ChartDataItem {
  name: string
  value: number
}

interface ChartProps {
  data: ChartDataItem[]
  title: string
  colorPalette?: string[]
}

// Tambahkan interface untuk data visit
interface VisitDataItem {
  _id: string
  kategori?: string
  nama_sales?: string
  namaSales?: string
  telda?: string
  sto?: string
  kegiatan?: string
  jenisKegiatan?: string
  poi_name?: string
  namaPOI?: string
  address?: string
  alamat?: string
  ekosistem?: string
  contact_name?: string
  namaPIC?: string
  contact_position?: string
  jabatanPIC?: string
  contact_phone?: string
  noHP?: string
  provider?: string
  provider_detail?: string
  detailProvider?: string
  cost?: string
  abonemen?: string
  feedback?: string
  feedback_detail?: string
  detailFeedback?: string
  detail_info?: string
  detailInformasi?: string
  photo_url?: string
  eviden?: string
  visit_ke?: number
  visitKe?: number
  timestamp: string | Date
  user_id?: string
  telegram_id?: string
}

// Tambahkan interface baru setelah ChartProps
interface ProviderTablesProps {
  data: ChartDataItem[]
  rawData?: VisitDataItem[]
}
// Komponen Diagram Batang Horisontal
const EnhancedHorizontalBarChart = ({ data, title, colorPalette }: ChartProps) => {
  // semua ekosistem
  const allEcosystems = [
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

  // Membuat data lengkap dengan semua ekosistem (termasuk nol)
  const completeData = allEcosystems
    .map((ecosystem) => {
      const existingData = data.find((item) => item.name === ecosystem)
      return {
        name: ecosystem,
        value: existingData ? existingData.value : 0,
      }
    })
    .sort((a, b) => b.value - a.value)

  const total = completeData.reduce((sum, item) => sum + item.value, 0)
  const maxValue = Math.max(...completeData.map((item) => item.value))

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Globe className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">Tidak ada data untuk ditampilkan</div>
      </div>
    )
  }

  const defaultColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
    "#14B8A6",
  ]

  const colors = colorPalette || defaultColors

  // Get ekosistem ikon
  const getEcosystemIcon = (ecosystem: string) => {
    const icons: { [key: string]: string } = {
      Ruko: "🏪",
      Sekolah: "🏫",
      Hotel: "🏨",
      Multifinance: "🏦",
      Health: "🏥",
      Ekspedisi: "📦",
      Energi: "⚡",
      Agriculture: "🌾",
      Properti: "🏢",
      Manufaktur: "🏭",
      "Media & Communication": "📺",
    }
    return icons[ecosystem] || "🏬"
  }

  // Split data jadi dua kolom jia > 6
  const shouldSplit = completeData.length > 6
  const midPoint = Math.ceil(completeData.length / 2)
  const leftColumn = shouldSplit ? completeData.slice(0, midPoint) : completeData
  const rightColumn = shouldSplit ? completeData.slice(midPoint) : []

  const renderEcosystemBars = (ecosystemData: typeof completeData) => (
    <div className="space-y-3">
      {ecosystemData.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0
        const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        const colorIndex = completeData.findIndex((d) => d.name === item.name)

        return (
          <div
            key={item.name}
            className="group hover:bg-gray-50 p-3 rounded-xl transition-all duration-300 border border-gray-300 hover:border-gray-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getEcosystemIcon(item.name)}</span>
                <div>
                  <span className="text-sm font-semibold text-black">{item.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: colors[colorIndex % colors.length],
                    minWidth: item.value > 0 ? "8px" : "0px",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <Globe className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {shouldSplit ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4 border-b border-gray-200 pb-2"></h4>
            {renderEcosystemBars(leftColumn)}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4 border-b border-gray-200 pb-2"></h4>
            {renderEcosystemBars(rightColumn)}
          </div>
        </div>
      ) : (
        renderEcosystemBars(leftColumn)
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Total Ekosistem Dikunjungi:</span>
            <span className="text-xl font-bold text-blue-900">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Provider Bar Chart - 3 columns
const ProviderBarChart = ({ data, title }: ChartProps) => {
  // Define all providers by category
  const providerCategories = {
    telkom: ["IndiHome", "Indibiz", "Wifi.id", "Astinet"],
    kompetitor: [
      "MyRepublic",
      "Biznet",
      "First Media",
      "Iconnet",
      "XL Smart",
      "MNC Play",
      "IFORTE",
      "Hypernet",
      "CBN",
      "Fibernet",
      "Fiberstar",
      "Other",
    ],
  }

  // Create complete data with all providers (including zeros)
  const allProviders = [...providerCategories.telkom, ...providerCategories.kompetitor]
  const completeData = allProviders.map((provider) => {
    const existingData = data.find((item) => item.name === provider)
    return {
      name: provider,
      value: existingData ? existingData.value : 0,
      category: providerCategories.telkom.includes(provider) ? "telkom" : "kompetitor",
    }
  })

  const total = completeData.reduce((sum, item) => sum + item.value, 0)
  const maxValue = Math.max(...completeData.map((item) => item.value))

  if (total === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-3">
          <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      </div>
    )
  }

  // Provider colors - Updated
  const getProviderColor = (providerName: string, category: string) => {
    const telkomColors: { [key: string]: string } = {
      IndiHome: "#E53E3E",
      Indibiz: "#D53F8C",
      "Wifi.id": "#38B2AC",
      Astinet: "#805AD5",
    }
    const kompetitorColors: { [key: string]: string } = {
      MyRepublic: "#EA4335",
      Biznet: "#4285F4",
      "First Media": "#9C27B0",
      Iconnet: "#96CEB4",
      "XL Smart": "#FFEAA7",
      "MNC Play": "#FF9800",
      IFORTE: "#98D8C8",
      Hypernet: "#F7DC6F",
      CBN: "#BB8FCE",
      Fibernet: "#85C1E9",
      Fiberstar: "#F8C471",
      Other: "#BDC3C7",
    }

    if (category === "telkom") {
      return telkomColors[providerName] || "#718096"
    }
    return kompetitorColors[providerName] || "#95A5A6"
  }

  // Get provider icon - Updated
  const getProviderIcon = (providerName: string) => {
    const icons: { [key: string]: string } = {
      IndiHome: "🏠",
      Indibiz: "🏢",
      "Wifi.id": "📶",
      Astinet: "🌟",
      MyRepublic: "🚀",
      Biznet: "🌐",
      "First Media": "📡",
      Iconnet: "💫",
      "XL Smart": "📱",
      "MNC Play": "📺",
      IFORTE: "⚡",
      Hypernet: "🔗",
      CBN: "📊",
      Fibernet: "🔌",
      Fiberstar: "⭐",
      Other: "🔧",
    }
    return icons[providerName] || "🌐"
  }

  // pisah data by category
  const telkomData = completeData.filter((item) => item.category === "telkom").sort((a, b) => b.value - a.value)
  const kompetitorData = completeData.filter((item) => item.category === "kompetitor").sort((a, b) => b.value - a.value)

  // Split kompetitor menajdi 2 kolom (6)
  const kompetitor1 = kompetitorData.slice(0, 6)
  const kompetitor2 = kompetitorData.slice(6, 12)

  const renderProviderBars = (providerData: typeof completeData, categoryTitle: string, bgColor: string) => (
    <div className="space-y-2">
      <div className={`${bgColor} rounded-lg p-2 mb-3`}>
        <h4 className="text-sm font-semibold text-black-700 text-center">{categoryTitle}</h4>
      </div>
      {providerData.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0
        const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        const color = getProviderColor(item.name, item.category)
        const icon = getProviderIcon(item.name)

        return (
          <div
            key={item.name}
            className="group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-base">{icon}</span>
                <div>
                  <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden shadow-inner">
                <div
                  className="h-2 rounded transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                    minWidth: item.value > 0 ? "4px" : "0px",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>

      {/* 3 Column Layout: 1 Telkom + 2 Kompetitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telkom Group */}
        <div>{renderProviderBars(telkomData, "TELKOM GROUP", "bg-red-100")}</div>
        {/* Combined Kompetitor Section */}
        <div className="lg:col-span-2">
          <div className="bg-orange-100 rounded-lg p-2 mb-3">
            <h4 className="text-sm font-semibold text-black-700 text-center">KOMPETITOR</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {kompetitor1.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                const color = getProviderColor(item.name, item.category)
                const icon = getProviderIcon(item.name)

                return (
                  <div
                    key={item.name}
                    className="group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{icon}</span>
                        <div>
                          <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{item.value}</div>
                        <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden shadow-inner">
                        <div
                          className="h-2 rounded transition-all duration-700 ease-out relative overflow-hidden"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: color,
                            minWidth: item.value > 0 ? "4px" : "0px",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-2">
              {kompetitor2.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                const color = getProviderColor(item.name, item.category)
                const icon = getProviderIcon(item.name)

                return (
                  <div
                    key={item.name}
                    className="group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{icon}</span>
                        <div>
                          <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{item.value}</div>
                        <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden shadow-inner">
                        <div
                          className="h-2 rounded transition-all duration-700 ease-out relative overflow-hidden"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: color,
                            minWidth: item.value > 0 ? "4px" : "0px",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-700">
              {telkomData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-xs text-red-600 font-medium">Telkom Group</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">
              {kompetitorData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-xs text-orange-400 font-medium">Kompetitor</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">{total}</div>
            <div className="text-xs text-blue-700 font-medium">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Provider Tables Component - Separate from Bar Chart
const ProviderTables = ({ data, rawData }: ProviderTablesProps) => {
  if (!rawData || rawData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-black mb-4">Distribusi Regional per Telda</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">Tidak ada data untuk tabel distribusi</div>
      </div>
    )
  }

  // Telda to STO mapping - Split into two groups
  const teldaSTOMapping = {
    group1: {
      Bangkalan: ["SPG", "KML", "ARB", "KPP", "BKL", "OMB", "BEA", "TBU"],
      Gresik: ["CRM", "POG", "BPG", "DDS", "SDY", "KDE", "BWN", "GSK"],
      Lamongan: ["SDD", "LMG", "BBA", "BDG"],
      Pamekasan: ["BAB", "ABT", "SPK", "PRG", "AJA", "WRP", "SMP", "PME", "SPD", "MSL"],
    },
    group2: {
      Tandes: ["DMO", "TNS", "KNN", "BBE", "KLN", "LKI", "KRP"],
      Ketintang: ["WRU", "IJK", "RKT", "TPO"],
      Manyar: ["GBG", "MYR", "JGR", "MGO"],
      Kanjeran: ["KPS", "PRK", "KBL", "KJR"],
    },
  }

  const mapProviderName = (provider: string) => {
    const normalizedProvider = provider.toLowerCase().trim()
    const mapping: { [key: string]: string } = {
      // Telkom Group variations
      indihome: "IndiHome",
      "indi home": "IndiHome",
      "telkom indihome": "IndiHome",
      indibiz: "Indibiz",
      "indi biz": "Indibiz",
      "telkom indibiz": "Indibiz",
      "wifi.id": "Wifi.id",
      "wifi id": "Wifi.id",
      wifiid: "Wifi.id",
      astinet: "Astinet",
      "telkom astinet": "Astinet",

      // Kompetitor variations
      myrep: "MyRepublic",
      "my rep": "MyRepublic",
      "my-rep": "MyRepublic",
      myrepublic: "MyRepublic",
      "my republic": "MyRepublic",
      biznet: "Biznet",
      "biz net": "Biznet",
      "biznet networks": "Biznet",
      firstmedia: "First Media",
      "first media": "First Media",
      "first-media": "First Media",
      firtsmedia: "First Media", // Handle typo in original data
      iconnet: "Iconnet",
      "icon net": "Iconnet",
      "icon+": "Iconnet",
      iconplus: "Iconnet",
      "xl smart": "XL Smart",
      xl: "XL Smart",
      "xl axiata": "XL Smart",
      xlsmart: "XL Smart",
      indosat: "MNC Play",
      "indosat mncplay": "MNC Play",
      "mnc play": "MNC Play",
      mncplay: "MNC Play",
      "indosat ooredoo": "MNC Play",
      ooredoo: "MNC Play",
      iforte: "IFORTE",
      "i-forte": "IFORTE",
      "i forte": "IFORTE",
      hypernet: "Hypernet",
      "hyper net": "Hypernet",
      "hyper-net": "Hypernet",
      cbn: "CBN",
      "cbn fiber": "CBN",
      "cbn fibre": "CBN",
      fibernet: "Fibernet",
      "fiber net": "Fibernet",
      "fiber-net": "Fibernet",
      fiberstar: "Fiberstar",
      "fiber star": "Fiberstar",
      "fiber-star": "Fiberstar",

      // Other
      other: "Other",
      "tidak diketahui": "Other",
    }
    return mapping[normalizedProvider] || provider
  }

  // Process data for each group
  const processGroupData = (groupMapping: { [key: string]: string[] }) => {
    if (!rawData) return { providers: [], teldas: Object.keys(groupMapping), allSTOs: [], tableData: {} }

    const allSTOs: string[] = []
    const teldas = Object.keys(groupMapping)
    teldas.forEach((telda: string) => {
      groupMapping[telda].forEach((sto: string) => {
        allSTOs.push(sto)
      })
    })

    // Define all possible providers from both categories
    const allPossibleProviders = [
      // Telkom Group
      "IndiHome",
      "Indibiz",
      "Wifi.id",
      "Astinet",
      "Telkom",
      // Kompetitor
      "MyRepublic",
      "Biznet",
      "First Media",
      "Iconnet",
      "XL Smart",
      "MNC Play",
      "IFORTE",
      "Hypernet",
      "CBN",
      "Fibernet",
      "Fiberstar",
      "Other",
    ]

    // Create table data structure with all possible providers
    const tableData: { [key: string]: { [key: string]: number } } = {}
    allPossibleProviders.forEach((provider) => {
      tableData[provider] = {}
      allSTOs.forEach((sto) => {
        tableData[provider][sto] = 0
      })
    })

    // Count occurrences
    rawData.forEach((item: VisitDataItem) => {
      let provider = item.provider || item.provider_detail || item.detailProvider || ""

      if (provider === "Kompetitor" && item.provider_detail && item.provider_detail !== "-") {
        provider = item.provider_detail
      }
      if (provider === "Telkom Group" && item.provider_detail && item.provider_detail !== "-") {
        provider = item.provider_detail
      }

      const sto = item.sto
      if (provider && sto && allSTOs.includes(sto) && provider !== "Belum Berlangganan Internet" && provider !== "-") {
        const mappedProvider = mapProviderName(provider)
        if (tableData[mappedProvider] && tableData[mappedProvider][sto] !== undefined) {
          tableData[mappedProvider][sto]++
        }
      }
    })

    // Filter out providers with no data for cleaner display, but keep structure
    const providersWithData = allPossibleProviders.filter((provider) => {
      const hasData = allSTOs.some((sto) => tableData[provider][sto] > 0)
      return hasData
    })

    // Always include all providers to show complete structure
    const providers = allPossibleProviders

    return { providers, teldas, allSTOs, tableData, groupMapping }
  }

  const group1Data = processGroupData(teldaSTOMapping.group1)
  const group2Data = processGroupData(teldaSTOMapping.group2)

  // Create table component with provider grouping
  const createTable = (groupData: any, groupTitle: string) => {
    const { providers, teldas, allSTOs, tableData, groupMapping } = groupData

    // Group providers by category
    const telkomProviders = ["IndiHome", "Indibiz", "Wifi.id", "Astinet"]
    const kompetitorProviders = [
      "MyRepublic",
      "Biznet",
      "First Media",
      "Iconnet",
      "XL Smart",
      "MNC Play",
      "IFORTE",
      "Hypernet",
      "CBN",
      "Fibernet",
      "Fiberstar",
    ]
    const otherProviders = ["Other"]

    const renderProviderRows = (providerList: string[], categoryName: string, bgColor: string) => {
      return (
        <>
          {/* Category Header */}
          <tr className={`${bgColor} font-semibold`}>
            <td colSpan={allSTOs.length + 2} className="border border-gray-300 px-4 py-2 text-center text-gray-800">
              {categoryName}
            </td>
          </tr>
          {/* Provider Rows */}
          {providerList.map((provider: string, providerIndex: number) => {
            const rowTotal = allSTOs.reduce((sum: number, sto: string) => sum + (tableData[provider]?.[sto] || 0), 0)
            return (
              <tr key={provider} className={providerIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">{provider}</td>
                {allSTOs.map((sto: string) => (
                  <td key={sto} className="border border-gray-300 px-2 py-2 text-center text-sm">
                    {tableData[provider]?.[sto] || 0}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-100">{rowTotal}</td>
              </tr>
            )
          })}
        </>
      )
    }

    return (
      <div className="mb-8">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">{groupTitle}</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              {/* Main Header */}
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Provider</th>
                <th
                  colSpan={allSTOs.length}
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 bg-blue-200"
                >
                  WITEL SURAMADU
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">TOTAL</th>
              </tr>
              {/* Telda Header */}
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2"></th>
                {teldas.map((telda: string) => (
                  <th
                    key={telda}
                    colSpan={groupMapping[telda].length}
                    className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 bg-gray-200"
                  >
                    {telda}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
              {/* STO Header */}
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2"></th>
                {allSTOs.map((sto: string) => (
                  <th
                    key={sto}
                    className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-600"
                  >
                    {sto}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {/* Telkom Group Providers */}
              {renderProviderRows(telkomProviders, "TELKOM GROUP", "bg-red-100")}

              {/* Kompetitor Providers */}
              {renderProviderRows(kompetitorProviders, "KOMPETITOR", "bg-orange-100")}

              {/* Other Providers */}
              {renderProviderRows(otherProviders, "LAINNYA", "bg-gray-200")}

              {/* Grand Total Row */}
              <tr className="bg-blue-100 font-semibold">
                <td className="border border-gray-300 px-4 py-2 text-gray-800">GRAND TOTAL</td>
                {allSTOs.map((sto: string) => {
                  const columnTotal = [...telkomProviders, ...kompetitorProviders, ...otherProviders].reduce(
                    (sum: number, provider: string) => sum + (tableData[provider]?.[sto] || 0),
                    0,
                  )
                  return (
                    <td key={sto} className="border border-gray-300 px-2 py-2 text-center text-sm font-bold">
                      {columnTotal}
                    </td>
                  )
                })}
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                  {allSTOs.reduce(
                    (sum: number, sto: string) =>
                      sum +
                      [...telkomProviders, ...kompetitorProviders, ...otherProviders].reduce(
                        (pSum: number, provider: string) => pSum + (tableData[provider]?.[sto] || 0),
                        0,
                      ),
                    0,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <Globe className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-black">Distribusi Regional per Telda</h3>
      </div>

      {/* Group 1 Table */}
      {createTable(group1Data, "Kelompok 1: Bangkalan - Gresik - Lamongan - Pamekasan")}

      {/* Group 2 Table */}
      {createTable(group2Data, "Kelompok 2: Tandes - Ketintang - Manyar - Kanjeran")}

      {/* Grand Total Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900 mb-1">{total}</div>
          <div className="text-sm text-blue-700 font-semibold">Total Kunjungan Seluruh WITEL SURAMADU</div>
        </div>
      </div>
    </div>
  )
}

const FeedbackDistributionChart = ({ data, title }: ChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          Tidak ada data feedback untuk ditampilkan
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const getFeedbackColor = (feedbackName: string) => {
    const name = feedbackName.toLowerCase()
    if (name === "tertarik berlangganan indibiz") {
      return {
        bg: "#10B981",
        text: "text-green-800",
        bgLight: "bg-green-50",
        border: "border-green-400",
        icon: "🎯",
      }
    } else if (name === "tidak tertarik berlangganan indibiz") {
      return {
        bg: "#EF4444",
        text: "text-red-800",
        bgLight: "bg-red-50",
        border: "border-red-400",
        icon: "❌",
      }
    } else if (name.includes("ragu-ragu") || name.includes("dipertimbangkan")) {
      return {
        bg: "#F59E0B",
        text: "text-yellow-800",
        bgLight: "bg-yellow-50",
        border: "border-yellow-400",
        icon: "🤔",
      }
    } else {
      return {
        bg: "#6B7280",
        text: "text-gray-800",
        bgLight: "bg-gray-50",
        border: "border-gray-400",
        icon: "📝",
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const colors = getFeedbackColor(item.name)
          return (
            <div
              key={index}
              className={`p-5 rounded-xl ${colors.bgLight} border ${colors.border} transition-all duration-300 hover:shadow-md group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{colors.icon}</span>
                  <h4 className={`font-bold ${colors.text} text-base`}>{item.name}</h4>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${colors.text}`}>{item.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{percentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-white rounded-full h-4 shadow-inner overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors.bg,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Enhanced Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{total}</div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Total Feedback</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ size?: number }>
  color?: string
  bgColor?: string
}

const StatCard = ({ title, value, icon: Icon, color = "text-blue-600", bgColor = "bg-blue-50" }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center">
      <div className={`p-4 rounded-xl ${bgColor} ${color}`}>
        <Icon size={28} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
)

const VisualisasiData = () => {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [data, setData] = useState<VisitDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  // State untuk tracking last refresh
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [serverMeta, setServerMeta] = useState<any>(null)

  // Date filter states
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showDateFilter, setShowDateFilter] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const dateFilterRef = useRef<HTMLDivElement>(null)

  // User info
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    role: "Administrator",
  })

  // Test backend connection
  const testConnection = async () => {
    try {
      console.log("🔍 Testing backend connection...")
      setConnectionStatus("checking")

      // Add cache busting parameter
      const response = await fetch(`http://localhost:5000/api/health?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const healthData = await response.json()
        console.log("✅ Backend connection successful:", healthData)
        setConnectionStatus("connected")
        return true
      } else {
        console.log("❌ Backend responded with error:", response.status, response.statusText)
        setConnectionStatus("disconnected")
        return false
      }
    } catch (error) {
      console.log("❌ Backend connection failed:", error)
      setConnectionStatus("disconnected")
      return false
    }
  }

  // Initialize date range (last 30 days)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    setEndDate(today.toISOString().split("T")[0])
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
  }, [])

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

  // Fetch data from database via backend API
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("📊 Fetching data from database via backend API...")

      // First test connection
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error("Backend server tidak dapat diakses. Pastikan server berjalan di http://localhost:5000")
      }

      // Add cache busting and force fresh request
      const response = await fetch(`http://localhost:5000/api/visit-data?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Endpoint /api/visit-data tidak ditemukan. Periksa konfigurasi backend.")
        } else if (response.status === 500) {
          throw new Error("Server error. Periksa koneksi database di backend.")
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }

      const result = await response.json()

      // Handle new response format with meta
      let actualData = result
      let meta = null

      if (result.data && result.meta) {
        actualData = result.data
        meta = result.meta
        setServerMeta(meta)
        console.log("📊 Server meta:", meta)
      }

      console.log("✅ Database data received:", actualData.length, "records")

      // Debug: tampilkan data terbaru untuk memastikan sinkronisasi
      console.log("🔍 Latest 3 records from database:")
      actualData.slice(0, 3).forEach((record: VisitDataItem, index: number) => {
        console.log(`   ${index + 1}. ID: ${record._id}, Timestamp: ${record.timestamp}, POI: ${record.poi_name}`)
      })

      // Debug: tampilkan total unik berdasarkan ID
      const uniqueIds = new Set(actualData.map((item: VisitDataItem) => item._id))
      console.log("📊 Unique records by ID:", uniqueIds.size)

      if (!Array.isArray(actualData)) {
        throw new Error("Data yang diterima bukan array. Format data tidak sesuai.")
      }

      setData(actualData)
      setLastRefresh(new Date())
      setConnectionStatus("connected")
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil data dari database"
      setError(errorMessage)
      console.error("❌ Error fetching database data:", err)
      setConnectionStatus("disconnected")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter data by date range
  const filteredData = data.filter((item) => {
    if (!startDate || !endDate) return true
    const itemDate = new Date(item.timestamp)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 9999)
    return itemDate >= start && itemDate <= end
  })

  // Process data for visualizations
  const processDataForCharts = () => {
    console.log("🔄 Processing database data for charts...")
    console.log("📊 Filtered data count:", filteredData.length)

    // 1. Kunjungan per Ekosistem
    const ekosistemData = filteredData.reduce((acc: { [key: string]: number }, item) => {
      const ekosistem = item.ekosistem || "Lainnya"
      acc[ekosistem] = (acc[ekosistem] || 0) + 1
      return acc
    }, {})

    const ekosistemChart = Object.entries(ekosistemData)
      .map(([name, value]) => ({
        name,
        value: value as number,
      }))
      .sort((a, b) => b.value - a.value)

    // 2. Distribusi Feedback
    const feedbackData = filteredData.reduce((acc: { [key: string]: number }, item) => {
      const feedback = item.feedback_detail || item.detailFeedback || "Tidak ada feedback"
      acc[feedback] = (acc[feedback] || 0) + 1
      return acc
    }, {})

    const feedbackChart = Object.entries(feedbackData)
      .map(([name, value]) => ({
        name,
        value: value as number,
      }))
      .sort((a, b) => b.value - a.value)

    // 3. Provider yang Digunakan - ENHANCED PROCESSING
    const providerData = filteredData.reduce((acc: { [key: string]: number }, item) => {
      let provider = item.provider || item.provider_detail || item.detailProvider || ""

      if (provider === "Kompetitor" && item.provider_detail && item.provider_detail !== "-") {
        provider = item.provider_detail
      }
      if (provider === "Telkom Group" && item.provider_detail && item.provider_detail !== "-") {
        provider = item.provider_detail
      }

      if (
        !provider ||
        provider === "-" ||
        provider === "Tidak diketahui" ||
        provider.trim() === "" ||
        provider === "Belum Berlangganan Internet"
      ) {
        acc["Other"] = (acc["Other"] || 0) + 1
        return acc
      }

      // Enhanced provider mapping with fixed typo
      const providerMapping: { [key: string]: string } = {
        // Telkom Group variations
        indihome: "IndiHome",
        "indi home": "IndiHome",
        "telkom indihome": "IndiHome",
        indibiz: "Indibiz",
        "indi biz": "Indibiz",
        "telkom indibiz": "Indibiz",
        "wifi.id": "Wifi.id",
        "wifi id": "Wifi.id",
        wifiid: "Wifi.id",
        astinet: "Astinet",
        "telkom astinet": "Astinet",
        telkom: "Telkom",

        // Kompetitor variations (fixed typo)
        myrep: "MyRepublic",
        "my rep": "MyRepublic",
        "my-rep": "MyRepublic",
        myrepublic: "MyRepublic",
        "my republic": "MyRepublic",
        biznet: "Biznet",
        "biz net": "Biznet",
        "biznet networks": "Biznet",
        firstmedia: "First Media",
        "first media": "First Media",
        "first-media": "First Media",
        firtsmedia: "First Media", // Handle typo in original data
        iconnet: "Iconnet",
        "icon net": "Iconnet",
        "icon+": "Iconnet",
        iconplus: "Iconnet",
        "xl smart": "XL Smart",
        xl: "XL Smart",
        "xl axiata": "XL Smart",
        xlsmart: "XL Smart",
        "indosat mncplay": "MNC Play",
        "mnc play": "MNC Play",
        mncplay: "MNC Play",
        indosat: "MNC Play",
        "indosat ooredoo": "MNC Play",
        ooredoo: "MNC Play",
        iforte: "IFORTE",
        "i-forte": "IFORTE",
        "i forte": "IFORTE",
        hypernet: "Hypernet",
        "hyper net": "Hypernet",
        "hyper-net": "Hypernet",
        cbn: "CBN",
        "cbn fiber": "CBN",
        "cbn fibre": "CBN",
        fibernet: "Fibernet",
        "fiber net": "Fibernet",
        "fiber-net": "Fibernet",
        fiberstar: "Fiberstar",
        "fiber star": "Fiberstar",
        "fiber-star": "Fiberstar",
        other: "Other",
        "tidak diketahui": "Other",
      }

      const normalizedProvider = provider.toLowerCase().trim()
      const mappedProvider = providerMapping[normalizedProvider] || provider

      acc[mappedProvider] = (acc[mappedProvider] || 0) + 1
      return acc
    }, {})

    const providerChart = Object.entries(providerData)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)

    // Debug log untuk melihat hasil akhir
    console.log("📊 Final provider data:", providerChart)

    // 4. Stats
    const totalKunjungan = filteredData.length
    const successRate = filteredData.filter(
      (item) => (item.feedback_detail || item.detailFeedback) === "Tertarik Berlangganan Indibiz",
    ).length
    const uniqueSales = new Set(filteredData.map((item) => item.nama_sales || item.namaSales)).size
    const uniquePOI = new Set(filteredData.map((item) => item.poi_name || item.namaPOI)).size

    console.log("📈 Stats calculated:", { totalKunjungan, successRate, uniqueSales, uniquePOI })

    return {
      ekosistemChart,
      feedbackChart,
      providerChart,
      stats: {
        totalKunjungan,
        successRate,
        uniqueSales,
        uniquePOI,
      },
    }
  }

  const chartData = processDataForCharts()

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    navigate("/login")
  }

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboardAdmin")
  }

  const handleUsersClick = () => {
    navigate("/users")
  }

  const handleRegisterClick = () => {
    const role = localStorage.getItem("role")
    if (role === "superadmin") {
      navigate("/register")
    } else {
      alert("Akses ditolak. Hanya Super Admin yang dapat mendaftarkan akun baru.")
    }
  }

  const applyDateFilter = () => {
    setShowDateFilter(false)
  }

  const resetDateFilter = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    setEndDate(today.toISOString().split("T")[0])
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
    setShowDateFilter(false)
  }

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

          <button
            onClick={handleUsersClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
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

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
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
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visualisasi Data</h1>
                <p className="text-sm text-gray-600">Analisis dan insight data kunjungan sales dari database</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Filter */}
              <div className="relative" ref={dateFilterRef}>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm bg-white border text-red-800 border-red-800 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Calendar size={16} />
                  <span>Filter Tanggal</span>
                  <ChevronDown size={16} />
                </button>
                {showDateFilter && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Pilih Rentang Tanggal</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tanggal Mulai</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tanggal Akhir</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={applyDateFilter}
                          className="flex-1 px-3 py-2 bg-red-700 text-white text-sm rounded-md hover:bg-red-800 transition-colors"
                        >
                          Terapkan
                        </button>
                        <button
                          onClick={resetDateFilter}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Memuat data dari database...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="text-red-600 mr-2 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="text-red-800 font-medium">Gagal memuat data dari database</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-red-600 text-xs">Troubleshooting:</p>
                    <ul className="text-red-600 text-xs list-disc list-inside space-y-1">
                      <li>Pastikan backend server berjalan di http://localhost:5000</li>
                      <li>Periksa koneksi database MongoDB</li>
                      <li>Cek log server untuk error detail</li>
                    </ul>
                    <button onClick={fetchData} className="text-sm text-red-600 hover:text-red-800 underline">
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
              {/* Date Range Info dengan Debug */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-800">
                    <strong>Periode Data:</strong> {new Date(startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(endDate).toLocaleDateString("id-ID")}
                    <span className="ml-2 font-semibold">
                      ({filteredData.length} data dari {data.length} total di database)
                    </span>
                  </p>
                  <div className="text-xs text-blue-600">
                    {lastRefresh && `Update: ${lastRefresh.toLocaleString("id-ID")}`}
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Kunjungan per Ekosistem - Enhanced Horizontal Bar Chart */}
                <EnhancedHorizontalBarChart
                  data={chartData.ekosistemChart.slice(0, 10)}
                  title="Kunjungan per Ekosistem"
                  colorPalette={[
                    "#3B82F6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#06B6D4",
                    "#84CC16",
                    "#F97316",
                    "#EC4899",
                    "#6B7280",
                  ]}
                />

                {/* Distribusi Feedback */}
                <FeedbackDistributionChart data={chartData.feedbackChart} title="Distribusi Feedback" />
              </div>

              {/* Provider Analysis - Separated Bar Chart and Tables */}
              <div className="space-y-8">
                {/* Provider Bar Chart - Compact */}
                <div className="max-w-screen mx-auto">
                  <ProviderBarChart data={chartData.providerChart} title="Analisis Provider Kompetitor" />
                </div>

                {/* Provider Tables - Full Width Below */}
                <div className="w-full">
                  <ProviderTables data={chartData.providerChart} rawData={filteredData} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default VisualisasiData