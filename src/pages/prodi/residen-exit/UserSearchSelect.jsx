"use client"

import { useState, useEffect, useRef } from "react"
import axios from "../../../api/axios"
import baseurl from "../../../api/baseurl"

const UserSearchSelect = ({
  value,
  onChange,
  error,
  required = false,
  placeholder = "Cari user...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showMinCharWarning, setShowMinCharWarning] = useState(false)

  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const API_BASE_URL = baseurl

  useEffect(() => {
    // Load initial user if value is provided
    if (value && !selectedUser) {
      loadUserById(value)
    }
  }, [value])

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowMinCharWarning(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm.length >= 3) {
      setShowMinCharWarning(false)
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchTerm)
      }, 300)
    } else if (searchTerm.length > 0 && searchTerm.length < 3) {
      setShowMinCharWarning(true)
      setUsers([])
    } else {
      setShowMinCharWarning(false)
      setUsers([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const loadUserById = async (userId) => {
    try {
      // You might want to create a specific endpoint for this
      const response = await axios.get(`${API_BASE_URL}/api/users/search?q=${userId}`)
      if (response.data.success && response.data.data.length > 0) {
        const user = response.data.data.find((u) => u.id == userId)
        if (user) {
          setSelectedUser(user)
          setSearchTerm(user.name)
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const searchUsers = async (query) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/residen-exits/search`, {
        params: { q: query, limit: 10 },
      })
      console.log(response)

      if (response.data.success) {
        setUsers(response.data.data)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error searching users:", error)
      setUsers([])
      if (error.response?.status === 422) {
        setShowMinCharWarning(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)

    // Clear selection if input is cleared
    if (!value) {
      setSelectedUser(null)
      onChange("")
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setSearchTerm(user.name)
    setIsOpen(false)
    setShowMinCharWarning(false)
    onChange(user.id)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (searchTerm.length >= 3) {
      searchUsers(searchTerm)
    }
  }

  const clearSelection = () => {
    setSelectedUser(null)
    setSearchTerm("")
    setUsers([])
    setIsOpen(false)
    setShowMinCharWarning(false)
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className={`position-relative ${className}`} ref={dropdownRef}>
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          className={`form-control ${error ? "is-invalid" : ""}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          required={required}
          autoComplete="off"
        />
        <div className="input-group-append">
          {selectedUser ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearSelection}
              title="Clear selection"
            >
              <i className="fas fa-times"></i>
            </button>
          ) : (
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="dropdown-menu show w-100 shadow-lg" style={{ maxHeight: "300px", overflowY: "auto" }}>
          {loading && (
            <div className="dropdown-item-text text-center py-3">
              <div className="spinner-border spinner-border-sm mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              Mencari...
            </div>
          )}

          {showMinCharWarning && (
            <div className="dropdown-item-text text-warning py-2">
              <i className="fas fa-info-circle mr-2"></i>
              Minimal 3 karakter untuk pencarian
            </div>
          )}

          {!loading && !showMinCharWarning && users.length === 0 && searchTerm.length >= 3 && (
            <div className="dropdown-item-text text-muted py-3 text-center">
              <i className="fas fa-search mr-2"></i>
              Tidak ada user ditemukan untuk "{searchTerm}"
            </div>
          )}

          {!loading && users.length > 0 && (
            <>
              <h6 className="dropdown-header">
                <i className="fas fa-users mr-1"></i>
                Hasil Pencarian ({users.length})
              </h6>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`dropdown-item ${selectedUser?.id === user.id ? "active" : ""}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="d-flex align-items-center">
                    <div className="mr-3">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", fontSize: "14px" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="font-weight-bold text-dark">{user.name}</div>
                      <small className="text-muted">
                        {user.username && `@${user.username} • `}
                        {user.email}
                      </small>
                    </div>
                    {selectedUser?.id === user.id && <i className="fas fa-check text-primary ml-2"></i>}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {error && <div className="invalid-feedback">{error}</div>}

      {selectedUser && (
        <small className="form-text text-success">
          <i className="fas fa-check-circle mr-1"></i>
          Dipilih: {selectedUser.name} ({selectedUser.username})
        </small>
      )}
    </div>
  )
}

export default UserSearchSelect