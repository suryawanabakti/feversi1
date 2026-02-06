import React from "react";
import { Link } from "react-router-dom";
import { CustomPagination } from "../../../../components/custom-pagination";

const ResidenTable = ({
    residen,
    loading,
    page,
    totalData,
    user,
    selectedResiden,
    selectAll,
    onSelectAll,
    onSelectRow,
    onPageChange,
    onEdit,
    onResetPassword,
    onDelete
}) => {

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Memuat data residen...</p>
            </div>
        );
    }

    if (residen.length === 0) {
        return (
            <div className="alert alert-info">
                <i className="fas fa-info-circle mr-2"></i>
                Tidak ada data residen yang ditemukan
            </div>
        );
    }

    const isAdminOrProdi = user?.roles && (user.roles[0].name === "admin" || user.roles[0].name === "prodi");
    const isAdmin = user?.roles && user.roles[0].name === "admin";

    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped">
                <thead className="thead-light">
                    <tr>
                        {isAdminOrProdi && (
                            <th className="text-center" style={{ width: "50px" }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="form-check-input"
                                />
                            </th>
                        )}
                        <th>NIM</th>
                        <th>Nama</th>
                        <th>Prodi</th>
                        <th>Tahap</th>
                        <th>Status Biodata</th>
                        {isAdmin && <th className="text-center">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {residen.map((data) => (
                        <tr key={data.id}>
                            {isAdminOrProdi && (
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedResiden.includes(data.id)}
                                        onChange={(e) => onSelectRow(data.id, e.target.checked)}
                                        className="form-check-input"
                                    />
                                </td>
                            )}
                            <td>
                                <Link
                                    to={`/residen/biodata/${data.id}`}
                                    className="text-danger font-weight-bold"
                                >
                                    {data.username}
                                </Link>
                            </td>
                            <td>{data.name}</td>
                            <td>{data.biodata?.prodi?.name}</td>
                            <td>{data.tahap}</td>
                            <td>
                                {data.biodata?.ktp && data.biodata?.alamat ? (
                                    <span className="badge badge-success badge-pill">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        Sudah Mengisi
                                    </span>
                                ) : (
                                    <span className="badge badge-warning badge-pill">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        Belum Mengisi
                                    </span>
                                )}
                            </td>
                            {isAdmin && (
                                <td>
                                    <div className="btn-group">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => onEdit(data.id)}
                                            title="Edit"
                                        >
                                            <i className="far fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-warning"
                                            onClick={() => onResetPassword(data.id, data.name)}
                                            title="Reset Password"
                                        >
                                            <i className="fas fa-key"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => onDelete(data.id, data.name)}
                                            title="Hapus"
                                        >
                                            <i className="far fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="d-flex justify-content-center mt-4">
                <CustomPagination
                    activePage={page}
                    itemsCountPerPage={10}
                    totalItemsCount={totalData}
                    pageRangeDisplayed={5}
                    onChange={onPageChange}
                />
            </div>
        </div>
    );
};

export default ResidenTable;
