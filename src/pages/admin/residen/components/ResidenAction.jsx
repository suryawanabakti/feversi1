import React from "react";
import Button from "react-bootstrap/Button";

const ResidenAction = ({
    user,
    totalData,
    selectedCount,
    onShowBulkUpdate,
    onShowCreate,
    onShowImport,
    onExport,
    onRefresh
}) => {
    const isAdmin = user?.roles && user?.roles?.[0]?.name === "admin";
    const isProdi = user?.roles && user?.roles?.[0]?.name === "prodi";
    const hasAccess = isAdmin || isProdi;

    return (
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">
                Daftar Residen
                <span className="ml-2 badge badge-primary badge-pill">
                    {totalData}
                </span>
                {selectedCount > 0 && (
                    <span className="ml-2 badge badge-success badge-pill">
                        {selectedCount} dipilih
                    </span>
                )}
            </h4>

            {hasAccess && (
                <div className="card-header-action">
                    {selectedCount > 0 && (
                        <Button
                            variant="success"
                            className="btn-icon mr-2"
                            onClick={onShowBulkUpdate}
                            title="Update Tahap Terpilih"
                        >
                            <i className="fas fa-edit"></i>
                        </Button>
                    )}

                    {isAdmin && (
                        <>
                            <Button
                                variant="primary"
                                className="btn-icon"
                                onClick={onShowCreate}
                                title="Tambah Residen"
                            >
                                <i className="fas fa-plus"></i>
                            </Button>

                            <Button
                                variant="primary"
                                className="btn-icon ml-2"
                                onClick={onShowImport}
                                title="Import Residen"
                            >
                                <i className="fas fa-file-import"></i>
                            </Button>

                            <Button
                                variant="primary"
                                className="btn-icon ml-2"
                                onClick={onExport}
                                title="Export Residen"
                            >
                                <i className="fas fa-file-export"></i>
                            </Button>
                        </>
                    )}

                    <Button
                        variant="primary"
                        className="btn-icon ml-2"
                        onClick={onRefresh}
                        title="Refresh Data"
                    >
                        <i className="fas fa-sync-alt"></i>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ResidenAction;
