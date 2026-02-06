import React, { useState } from "react"
import { Spinner, Table, Form } from "react-bootstrap"

/**
 * CustomTable Component
 * 
 * A reusable, professional table component designed to replace MUI DataGrid.
 * Supports selection, pagination (local for now), and custom renderers.
 */
const CustomTable = ({
    columns,
    rows,
    loading,
    checkboxSelection = false,
    onSelectionModelChange,
    pageSize = 5,
}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedIds, setSelectedIds] = useState([])

    // Calculate pagination
    const totalPages = Math.ceil(rows.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedRows = rows.slice(startIndex, startIndex + pageSize)

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = rows.map((row) => row.id)
            setSelectedIds(allIds)
            onSelectionModelChange && onSelectionModelChange(allIds)
        } else {
            setSelectedIds([])
            onSelectionModelChange && onSelectionModelChange([])
        }
    }

    const handleSelectRow = (id) => {
        let newSelected = []
        if (selectedIds.includes(id)) {
            newSelected = selectedIds.filter((item) => item !== id)
        } else {
            newSelected = [...selectedIds, id]
        }
        setSelectedIds(newSelected)
        onSelectionModelChange && onSelectionModelChange(newSelected)
    }

    return (
        <div className="custom-table-container">
            <div className="table-responsive">
                <Table hover className={`align-middle ${loading ? "opacity-50" : ""}`}>
                    <thead className="bg-light">
                        <tr>
                            {checkboxSelection && (
                                <th style={{ width: "40px" }}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedIds.length === rows.length && rows.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th key={col.field} style={{ width: col.width || "auto" }}>
                                    {col.headerName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (checkboxSelection ? 1 : 0)} className="text-center py-5">
                                    <Spinner animation="border" variant="danger" />
                                    <p className="mt-2 text-muted">Memuat data...</p>
                                </td>
                            </tr>
                        ) : paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (checkboxSelection ? 1 : 0)} className="text-center py-5">
                                    <p className="text-muted mb-0">Tidak ada data untuk ditampilkan</p>
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((row) => (
                                <tr key={row.id}>
                                    {checkboxSelection && (
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.field}>
                                            {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted small">
                        Menampilkan {startIndex + 1} sampai {Math.min(startIndex + pageSize, rows.length)} dari {rows.length} entri
                    </div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                    Sebelumnya
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                    Selanjutnya
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default CustomTable
