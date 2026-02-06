import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "../api/axios";
import useAuthContext from "../context/AuthContext";

export default function useResiden() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthContext();

    // Data States
    const [residen, setResiden] = useState([]);
    const [loading, setLoading] = useState(false); // Global loading for actions
    const [tableLoading, setTableLoading] = useState(true);
    const [prodiList, setProdiList] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    // Filter States
    const [term, setTerm] = useState(searchParams.get("term") || "");
    const [prodiId, setProdiId] = useState(searchParams.get("prodi") || "semua");
    const [status, setStatus] = useState(searchParams.get("status") || "");

    // Selection States
    const [selectedResiden, setSelectedResiden] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Fetch Data Function
    const fetchResidenData = async (
        pageNumber = page,
        searchTerm = term,
        prodiFilter = prodiId,
        statusFilter = status
    ) => {
        setTableLoading(true);
        // Reset selection on fetch
        setSelectedResiden([]);
        setSelectAll(false);

        try {
            // Updated to GET with query params
            const res = await axios.get(`/api/residen`, {
                params: {
                    page: pageNumber,
                    term: searchTerm,
                    prodiId: prodiFilter,
                    status: statusFilter,
                }
            });

            // Handle JsonResource
            setResiden(res.data.data);
            setPage(res.data.meta?.current_page || res.data.current_page || 1);
            setTotalData(res.data.meta?.total || res.data.total || 0);
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengambil data residen");
        } finally {
            setTableLoading(false);
        }
    };

    // Helper: Fetch Prodi List (for Admin)
    const fetchProdiList = async () => {
        try {
            const res = await axios.get("/api/prodi-options");
            setProdiList(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengambil data prodi");
        }
    };

    // Effects
    useEffect(() => {
        // Initial fetch using current state
        fetchResidenData(1, term, prodiId, status);

        // Fetch prodi list only if admin
        if (user?.roles?.[0]?.name === "admin") {
            fetchProdiList();
        }
    }, []); // Run once on mount

    // Actions
    const handleRefresh = () => {
        setTerm("");
        setProdiId("semua");
        setStatus("");
        setSearchParams({}); // Clear URL params
        fetchResidenData(1, "", "semua", "");
    };

    const deleteResiden = async (id, name) => {
        if (!confirm(`Apakah anda yakin menghapus ${name}?`)) return;

        setLoading(true);
        try {
            // Updated to DELETE method
            await axios.delete(`/api/residen/${id}`);
            toast.success("Berhasil hapus residen");
            fetchResidenData(page, term, prodiId, status);
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus data");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (id, name) => {
        if (!confirm(`Apakah anda yakin Reset Password ${name}?`)) return;

        setLoading(true);
        try {
            await axios.post(`/api/reset-password/${id}`);
            toast.success(`Berhasil reset password ${name}`);
        } catch (err) {
            console.error(err);
            toast.error(`Gagal reset password ${name}`);
        } finally {
            setLoading(false);
        }
    };

    // Bulk Actions
    const handleBulkUpdate = async (tahap, callback) => {
        if (!tahap) {
            toast.error("Pilih tahap yang akan diupdate");
            return;
        }

        setLoading(true);
        try {
            await axios.post("/api/residen/bulk-update-tahap", {
                residen_ids: selectedResiden,
                tahap,
            });
            toast.success(`Berhasil update tahap ${selectedResiden.length} residen`);
            fetchResidenData(page, term, prodiId, status);
            if (callback) callback(); // Close modal
        } catch (err) {
            console.error(err);
            toast.error("Gagal update tahap massal");
        } finally {
            setLoading(false);
        }
    };

    return {
        state: {
            residen,
            loading,
            tableLoading,
            prodiList,
            page,
            totalData,
            term,
            prodiId,
            status,
            selectedResiden,
            selectAll
        },
        setters: {
            setTerm,
            setProdiId,
            setStatus,
            setPage,
            setSelectedResiden,
            setSelectAll,
            setLoading,
        },
        actions: {
            fetchResidenData,
            handleRefresh,
            deleteResiden,
            resetPassword,
            handleBulkUpdate
        }
    };
}
