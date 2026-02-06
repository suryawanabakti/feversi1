"use client";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthContext from "../../../context/AuthContext";
import baseurl from "../../../api/baseurl";
import axios from "../../../api/axios";

// Hooks
import useResiden from "../../../hooks/useResiden";

// Components
import ResidenAction from "./components/ResidenAction";
import ResidenFilter from "./components/ResidenFilter";
import ResidenTable from "./components/ResidenTable";
import Create from "./Create";
import Import from "./Import";

// Styles
import "./residen-style.css";

const Residen = () => {
  const { user } = useAuthContext();
  const {
    state,
    setters,
    actions
  } = useResiden();

  // Local Modal States
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  // Edit State
  const [editData, setEditData] = useState({ id: "", username: "", name: "", tahap: "" });
  const [editErrors, setEditErrors] = useState([]);

  // Bulk State
  const [bulkTahap, setBulkTahap] = useState("");
  const [bulkErrors, setBulkErrors] = useState([]);

  // --- Handlers ---

  const handleExport = () => {
    window.location.href = `${baseurl}/api/residen-export?status=${state.status}&prodi_id=${state.prodiId}`;
  };

  // Edit Handlers
  const handleShowEdit = async (id) => {
    try {
      // Updated to RESTful Show: GET /api/residen/{id}
      const res = await axios.get(`/api/residen/${id}`);
      setEditData({
        id: res.data.data.id,
        username: res.data.data.username,
        name: res.data.data.name,
        tahap: res.data.data.tahap || ""
      });
      setShowEdit(true);
      setEditErrors([]);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data residen");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setters.setLoading(true);
    try {
      // Updated to RESTful Update: PUT /api/residen/{id}
      await axios.put(`/api/residen/${editData.id}`, {
        username: editData.username,
        name: editData.name,
        tahap: editData.tahap,
      });
      toast.success("Berhasil mengubah data residen");
      actions.fetchResidenData(state.page, state.term, state.prodiId, state.status);
      setShowEdit(false);
    } catch (err) {
      if (err.response?.status === 422) {
        setEditErrors(err.response.data.errors);
      } else {
        console.error(err);
        toast.error("Gagal menyimpan perubahan");
      }
    } finally {
      setters.setLoading(false);
    }
  };

  // Bulk Update Handlers
  const confirmBulkUpdate = (e) => {
    e.preventDefault();
    actions.handleBulkUpdate(bulkTahap, () => {
      setShowBulkUpdate(false);
      setBulkTahap("");
    });
  };

  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="section-header d-flex justify-content-between align-items-center">
            <h1 className="font-weight-bold">Residen Aktif</h1>
            <div className="section-header-breadcrumb">
              <div className="breadcrumb-item">
                <Link to="/dashboard">Dashboard</Link>
              </div>
              <div className="breadcrumb-item active">Residen</div>
            </div>
          </div>

          <div className="section-body">
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">

                  <ResidenAction
                    user={user}
                    totalData={state.totalData}
                    selectedCount={state.selectedResiden.length}
                    onShowBulkUpdate={() => setShowBulkUpdate(true)}
                    onShowCreate={() => setShowCreate(true)}
                    onShowImport={() => setShowImport(true)}
                    onExport={handleExport}
                    onRefresh={actions.handleRefresh}
                  />

                  <div className="card-body">
                    <ResidenFilter
                      user={user}
                      prodiList={state.prodiList}
                      prodiId={state.prodiId}
                      status={state.status}
                      term={state.term}
                      loading={state.loading}
                      onProdiChange={(val) => {
                        setters.setProdiId(val);
                        setters.setTerm("");
                        actions.fetchResidenData(1, "", val, state.status);
                      }}
                      onStatusChange={(val) => {
                        setters.setStatus(val);
                        setters.setTerm("");
                        actions.fetchResidenData(1, "", state.prodiId, val);
                      }}
                      onSearchChange={setters.setTerm}
                      onSearchSubmit={(e) => {
                        e.preventDefault();
                        actions.fetchResidenData(1, state.term, state.prodiId, state.status);
                      }}
                    />

                    <ResidenTable
                      residen={state.residen}
                      loading={state.tableLoading}
                      page={state.page}
                      totalData={state.totalData}
                      user={user}
                      selectedResiden={state.selectedResiden}
                      selectAll={state.selectAll}
                      onSelectAll={(checked) => {
                        setters.setSelectAll(checked);
                        setters.setSelectedResiden(checked ? state.residen.map(r => r.id) : []);
                      }}
                      onSelectRow={(id, checked) => {
                        if (checked) {
                          setters.setSelectedResiden(prev => [...prev, id]);
                        } else {
                          setters.setSelectedResiden(prev => prev.filter(item => item !== id));
                          setters.setSelectAll(false);
                        }
                      }}
                      onPageChange={(p) => actions.fetchResidenData(p, state.term, state.prodiId, state.status)}
                      onEdit={handleShowEdit}
                      onResetPassword={actions.resetPassword}
                      onDelete={actions.deleteResiden}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <Create
        show={showCreate}
        handleClose={() => setShowCreate(false)}
        onSuccess={() => actions.fetchResidenData(state.page, state.term, state.prodiId, state.status)}
      />

      <Import
        show={showImport}
        handleClose={() => setShowImport(false)}
      />

      {/* Bulk Update Modal */}
      <Modal show={showBulkUpdate} onHide={() => setShowBulkUpdate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit mr-2"></i> Update Tahap Massal
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={confirmBulkUpdate}>
          <Modal.Body>
            <div className="alert alert-info">
              <i className="fas fa-info-circle mr-2"></i>
              Anda akan mengupdate tahap untuk <strong>{state.selectedResiden.length}</strong> residen.
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Tahap Baru <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={bulkTahap}
                onChange={(e) => setBulkTahap(e.target.value)}
              >
                <option value="">Pilih Tahap</option>
                <option value="Tahap 1">Tahap 1</option>
                <option value="Tahap 2">Tahap 2</option>
                <option value="Tahap 3">Tahap 3</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBulkUpdate(false)}>Batal</Button>
            <Button variant="success" type="submit" disabled={state.loading}>
              {state.loading ? "Updating..." : "Update"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="far fa-edit mr-2"></i> Edit Residen</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>NIM <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                isInvalid={!!editErrors.username}
              />
              <Form.Control.Feedback type="invalid">{editErrors.username?.[0]}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">{editErrors.name?.[0]}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tahap <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={editData.tahap}
                onChange={(e) => setEditData({ ...editData, tahap: e.target.value })}
              >
                <option value="">Pilih Tahap</option>
                <option value="Tahap 1">Tahap 1</option>
                <option value="Tahap 2">Tahap 2</option>
                <option value="Tahap 3">Tahap 3</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Batal</Button>
            <Button variant="primary" type="submit" disabled={state.loading}>
              {state.loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Residen;
