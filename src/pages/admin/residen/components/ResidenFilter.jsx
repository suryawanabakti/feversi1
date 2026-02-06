import React from "react";
import Spinner from "react-bootstrap/Spinner";

const ResidenFilter = ({
    user,
    prodiList,
    prodiId,
    status,
    term,
    loading,
    onProdiChange,
    onStatusChange,
    onSearchChange,
    onSearchSubmit
}) => {
    const isAdmin = user?.roles && user?.roles?.[0]?.name === "admin";

    return (
        <div className="row mb-4">
            {isAdmin && (
                <div className="col-md-4 mb-3">
                    <label className="form-label">Filter Program Studi</label>
                    <select
                        className="form-select custom-select"
                        onChange={(e) => onProdiChange(e.target.value)}
                        value={prodiId}
                    >
                        <option value="semua">Semua Prodi</option>
                        {prodiList.map((data) => (
                            <option value={data.id} key={data.id}>
                                {data.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="col-md-4 mb-3">
                <label className="form-label">Filter Status Biodata</label>
                <select
                    className="form-select custom-select"
                    onChange={(e) => onStatusChange(e.target.value)}
                    value={status}
                >
                    <option value="">Semua Status Biodata</option>
                    <option value="belum">Belum Isi Biodata</option>
                    <option value="sudah">Sudah Isi Biodata</option>
                </select>
            </div>

            <div className="col-md-4 mb-3">
                <label className="form-label">Cari Residen</label>
                <form onSubmit={onSearchSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={term}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari berdasarkan NIM/Nama..."
                        />
                        <div className="input-group-append">
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <i className="fas fa-search"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResidenFilter;
