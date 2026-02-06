import React from "react";
import { Card, Table, Badge, Dropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * LayananTable Component
 * 
 * Reusable table component for displaying layanan records (informasi, pengaduan, konseling).
 * 
 * @param {Array} data - Array of layanan records
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {string} type - Type of layanan (informasi, pengaduan, konseling)
 */
const LayananTable = ({ data, onEdit, onDelete, type }) => {
    const getStatusBadge = (hasResponse) => {
        return hasResponse ? (
            <Badge bg="success" className="px-2 py-1">
                <i className="fas fa-check-circle me-1"></i>
                Sudah Direspon
            </Badge>
        ) : (
            <Badge bg="warning" text="dark" className="px-2 py-1">
                <i className="fas fa-clock me-1"></i>
                Menunggu Respon
            </Badge>
        );
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: "25%" }}>Topik</th>
                                <th style={{ width: "35%" }}>Deskripsi</th>
                                <th style={{ width: "25%" }}>Respon</th>
                                <th style={{ width: "15%", textAlign: "center" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                                        Belum ada data {type}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="fw-semibold">{item.topik}</div>
                                            {item.file && (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary mt-1"
                                                >
                                                    <i className="fas fa-paperclip me-1"></i>
                                                    File Pendukung
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{ maxWidth: "300px" }}>
                                                {item.deskripsi}
                                            </div>
                                        </td>
                                        <td>
                                            {item.has_response ? (
                                                <div>
                                                    {getStatusBadge(true)}
                                                    <div className="mt-2 text-muted small">
                                                        {item.respon}
                                                    </div>
                                                </div>
                                            ) : (
                                                getStatusBadge(false)
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Dropdown>
                                                <Dropdown.Toggle
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="btn-icon"
                                                >
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu align="end">
                                                    {item.can_edit && (
                                                        <Dropdown.Item onClick={() => onEdit(item)}>
                                                            <i className="fas fa-edit me-2"></i>
                                                            Edit
                                                        </Dropdown.Item>
                                                    )}
                                                    {item.can_delete && (
                                                        <Dropdown.Item
                                                            onClick={() => onDelete(item)}
                                                            className="text-danger"
                                                        >
                                                            <i className="fas fa-trash me-2"></i>
                                                            Hapus
                                                        </Dropdown.Item>
                                                    )}
                                                    {!item.can_edit && !item.can_delete && (
                                                        <Dropdown.Item disabled>
                                                            <i className="fas fa-lock me-2"></i>
                                                            Sudah Direspon
                                                        </Dropdown.Item>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};

export default LayananTable;
