import React, { useEffect, useState } from "react"
import { Button, Modal, Form, Spinner, Row, Col } from "react-bootstrap"
import axios from "../../../api/axios"
import toast from "react-hot-toast"

export default function BeriRespon({ show, setShow, handleClose, detailData, getData, informasi }) {
  const [respon, setRespon] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (show) {
      setRespon(detailData.respon || "")
    }
  }, [show, detailData.respon])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    const tid = toast.loading("Mengirim respon...")
    try {
      const res = await axios.put(`/api/admin/layanan-informasi/${detailData.id}`, {
        respon,
      })

      if (res.data.success) {
        toast.success(res.data.message || "Respon berhasil disimpan", { id: tid })
        // Use the getData function from parent to refresh the list at current page
        getData(informasi.activePage)
        setShow(false)
      }
    } catch (error) {
      console.error("Error giving response:", error)
      toast.error("Gagal mengirim respon", { id: tid })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
      contentClassName="border-0 shadow-lg"
      style={{ borderRadius: '15px' }}
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold text-dark">
          Beri Respon Informasi
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-4">
          <div className="bg-light p-4 rounded-4 mb-4" style={{ borderRadius: '12px' }}>
            <Row className="mb-3">
              <Col sm={3} className="text-muted small fw-bold text-uppercase">Pemohon</Col>
              <Col sm={9} className="text-dark fw-bold">{detailData.nim} - {detailData.name}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={3} className="text-muted small fw-bold text-uppercase">Topik</Col>
              <Col sm={9} className="text-dark">{detailData.topik}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={3} className="text-muted small fw-bold text-uppercase">Tanggal</Col>
              <Col sm={9} className="text-muted small">
                {detailData.createdAt ? new Date(detailData.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "-"}
              </Col>
            </Row>
            <hr className="my-3 opacity-10" />
            <Row>
              <Col sm={3} className="text-muted small fw-bold text-uppercase">Deskripsi</Col>
              <Col sm={9} className="text-dark" style={{ lineHeight: '1.6' }}>{detailData.deskripsi}</Col>
            </Row>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Respon Admin</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Ketikkan respon atau jawaban untuk residen..."
              className="border-0 bg-light p-3"
              style={{ borderRadius: '12px', resize: 'none' }}
              value={respon}
              onChange={(e) => setRespon(e.target.value)}
              required
            />
            <Form.Text className="text-muted mt-2 d-block">
              <i className="fas fa-info-circle mr-1"></i> Respon ini akan dikirimkan ke WhatsApp residen jika nomor tersedia.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0 pb-4 px-4">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="fw-bold px-4 rounded-pill shadow-none"
            style={{ border: 'none' }}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={processing}
            className="fw-bold px-5 rounded-pill shadow-sm"
          >
            {processing ? (
              <>
                <Spinner size="sm" className="mr-2" /> Mengirim...
              </>
            ) : "Simpan Respon"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
