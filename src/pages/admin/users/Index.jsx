import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-hot-toast";
import axios from "../../../api/axios";
import Select from "react-select";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create or edit
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        role: null,
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/management-users");
            setUsers(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data user");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get("/api/roles/non-residen");
            const roleOptions = res.data.data.map((role) => ({
                value: role.name,
                label: role.name,
            }));
            setRoles(roleOptions);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data role");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            name: "",
            username: "",
            email: "",
            password: "",
            role: null,
        });
    };

    const handleShowCreate = () => {
        setModalMode("create");
        setFormData({
            name: "",
            username: "",
            email: "",
            password: "",
            role: null,
        });
        setShowModal(true);
    };

    const handleShowEdit = (user) => {
        setModalMode("edit");
        setSelectedUser(user);
        const userRole = user.roles && user.roles.length > 0 ? user?.roles?.[0]?.name : "";
        const selectedRole = roles.find((r) => r.value === userRole);

        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: "", // Leave blank for edit unless changing
            role: selectedRole,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
            try {
                await axios.delete(`/api/management-users/${id}`);
                toast.success("User berhasil dihapus");
                fetchUsers();
            } catch (error) {
                console.error(error);
                toast.error("Gagal menghapus user");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                role: formData.role ? formData.role.value : "",
            };

            if (modalMode === "create") {
                await axios.post("/api/management-users", payload);
                toast.success("User berhasil dibuat");
            } else {
                await axios.put(`/api/management-users/${selectedUser.id}`, payload);
                toast.success("User berhasil diperbarui");
            }
            handleClose();
            fetchUsers();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.errors) {
                // Show specific validation errors if needed, for now general toast
                const errors = error.response.data.errors;
                Object.values(errors).forEach(errArray => {
                    errArray.forEach(msg => toast.error(msg));
                });
            } else {
                toast.error("Gagal menyimpan data user");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-content">
            <section className="section">
                <div className="section-header d-flex justify-content-between">
                    <h1>Manajemen User</h1>
                    <Button variant="primary" onClick={handleShowCreate}>
                        <i className="fas fa-plus me-2"></i> Tambah User
                    </Button>
                </div>

                <div className="section-body">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th width="50" className="text-center">No</th>
                                            <th>Nama</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th className="text-center">Role</th>
                                            <th width="150" className="text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <Spinner animation="border" variant="primary" />
                                                    <p className="mt-2 mb-0">Memuat data...</p>
                                                </td>
                                            </tr>
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <div className="empty-state">
                                                        <i className="fas fa-users-slash empty-state-icon"></i>
                                                        <h5>Tidak ada data user</h5>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-2 text-primary">
                                                                <i className="fas fa-user"></i>
                                                            </div>
                                                            <span className="fw-medium">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.username}</td>
                                                    <td>{item.email}</td>
                                                    <td className="text-center">
                                                        {item.roles.map((role) => (
                                                            <Badge key={role.id} bg="info" className="me-1">
                                                                {role.name}
                                                            </Badge>
                                                        ))}
                                                    </td>
                                                    <td className="text-center">
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleShowEdit(item)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onHide={handleClose}>
                <form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalMode === "create" ? "Tambah User" : "Edit User"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Nama Lengkap</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password {modalMode === 'edit' && <span className="text-muted small">(Kosongkan jika tidak ingin mengubah)</span>}</label>
                            <input
                                type="password"
                                className="form-control"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                minLength={8}
                                required={modalMode === "create"}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Role</label>
                            <Select
                                options={roles}
                                value={formData.role}
                                onChange={(role) => setFormData({ ...formData, role })}
                                placeholder="Pilih Role"
                                required
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}
