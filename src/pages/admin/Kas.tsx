import React, { useState } from 'react';
import { useData, Transaction } from '../../contexts/DataContext';
import { Plus, ArrowUpRight, ArrowDownRight, Search, Download, Edit2, Trash2, RefreshCw } from 'lucide-react';

const formatIDR = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0 }).replace(/,/g, '.');
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getLocalDateString = (dateObjOrStr: Date | string) => {
  const d = new Date(dateObjOrStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = () => {
  return getLocalDateString(new Date());
};

const getFirstDayOfMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getLastDayOfMonthString = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return getLocalDateString(lastDay);
};

export default function Kas() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, syncFromSheets, isSyncing, syncError } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isKasKeluar, setIsKasKeluar] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date range filter states (defaulting to current month's dates)
  const [startDate, setStartDate] = useState<string>(getFirstDayOfMonthString);
  const [endDate, setEndDate] = useState<string>(getLastDayOfMonthString);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL' | 'TODAY' | 'MONTH' | 'CUSTOM'>('MONTH');

  const handleOpenModal = (isKeluar: boolean, transaction?: Transaction) => {
    setIsKasKeluar(isKeluar);
    if (transaction) {
      setFormData({ description: transaction.description, amount: transaction.amount.toString() });
      setEditingId(transaction.id);
    } else {
      setFormData({ description: '', amount: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const txData = {
      description: formData.description,
      amount: Number(formData.amount),
      type: isKasKeluar ? 'OUT' : 'IN' as 'IN' | 'OUT'
    };

    if (editingId) {
      updateTransaction(editingId, txData);
    } else {
      addTransaction(txData);
    }

    handleCloseModal();
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId !== null) {
      deleteTransaction(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const filteredTransactions = transactions.filter(t => {
    // 1. Filter by search query
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filter by date-range (local time comparison for maximum correctness)
    const txLocalDate = getLocalDateString(t.date);
    if (startDate && txLocalDate < startDate) return false;
    if (endDate && txLocalDate > endDate) return false;

    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran'];
    const csvData = filteredTransactions.map(t => {
      const pemasukan = t.type === 'IN' ? t.amount : 0;
      const pengeluaran = t.type === 'OUT' ? t.amount : 0;
      // Menghilangkan koma pada format tanggal agar tidak mengacaukan CSV
      const dateStr = formatDate(t.date).replace(/,/g, ''); 
      return `"${dateStr}","${t.description}",${pemasukan},${pengeluaran}`;
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `buku_kas_tiffany_cake_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPemasukan = filteredTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalPengeluaran = filteredTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans">
      {syncError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex flex-col gap-1.5 shadow-sm">
          <div className="font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-pulse"></span>
            Koneksi Google Sheets Terhambat
          </div>
          <p className="text-gray-650 text-xs">
            Detail kendala: <code className="bg-red-100 px-1.5 py-0.5 rounded text-xs text-red-700 font-mono italic">{syncError}</code>. 
          </p>
          <p className="text-gray-500 text-xs mt-1">
            * Tips: Periksa menu <span className="font-semibold">Pengaturan Web</span>, pastikan Google Apps Script Extension URL sudah diisi dengan benar dan script tersebut sudah dipublikasikan sebagai <span className="font-semibold">Web App</span> dengan akses <span className="font-semibold">"Anyone"</span> agar data bisa muncul dan disinkronkan ke toko ini secara real-time.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#4a3b32] flex items-center gap-2">
            Buku Kas
            {isSyncing && <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full animate-pulse">Sinkronisasi Aktif</span>}
          </h1>
          <p className="text-sm text-[#8c7b70] mt-1">Catat dan pantau arus kas Anda.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button 
            onClick={syncFromSheets}
            disabled={isSyncing}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium border transition-all ${
              isSyncing 
                ? 'bg-amber-50 text-amber-500 border-amber-200 cursor-not-allowed' 
                : 'bg-stone-50 hover:bg-[#f4ecd8] text-[#4a3b32] border-[#ebdxc8]'
            }`}
            title="Sinkronkan data dengan Google Sheets sekarang"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan'}</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            title="Download CSV untuk Spreadsheet"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          <button 
            onClick={() => handleOpenModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <ArrowDownRight className="w-5 h-5" />
            Pengeluaran
          </button>
          <button 
            onClick={() => handleOpenModal(false)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-2.5 rounded-xl font-medium hover:bg-green-100 transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
            Pemasukan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#f4ecd8]">
          <div className="text-sm font-medium text-[#8c7b70] mb-2">Total Pemasukan</div>
          <div className="text-2xl font-bold text-green-600">{formatIDR(totalPemasukan)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#f4ecd8]">
          <div className="text-sm font-medium text-[#8c7b70] mb-2">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-red-600">{formatIDR(totalPengeluaran)}</div>
        </div>
        <div className="bg-[#4a3b32] p-6 rounded-2xl shadow-sm border border-[#4a3b32]">
          <div className="text-sm font-medium text-[#e8dfc8] mb-2">Saldo Akhir</div>
          <div className="text-2xl font-bold text-white">{formatIDR(saldoAkhir)}</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f4ecd8] overflow-hidden">
        <div className="p-5 border-b border-[#f4ecd8] flex flex-col gap-4 bg-[#fdfbf7]">
          {/* Judul & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="font-semibold text-[#4a3b32] text-lg">Riwayat Transaksi</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#f4ecd8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a485] transition-all text-sm"
              />
            </div>
          </div>

          {/* Filter Rentang Tanggal & Tombol Cepat */}
          <div className="flex flex-col lg:flex-row gap-4 pt-3 border-t border-[#f4ecd8]/40 items-start lg:items-center justify-between">
            {/* Input Date Range */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#8c7b70] whitespace-nowrap">Mulai:</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActiveQuickFilter('CUSTOM');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#ebdxc8] rounded-xl text-xs text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#c4a485] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#8c7b70] whitespace-nowrap">Sampai:</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActiveQuickFilter('CUSTOM');
                  }}
                  className="px-3 py-1.5 bg-[#fdfbf7] border border-[#ebdxc8] rounded-xl text-xs text-[#4a3b32] focus:outline-[#c4a485] focus:outline-2 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Tombol Cepat */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  const today = getTodayString();
                  setStartDate(today);
                  setEndDate(today);
                  setActiveQuickFilter('TODAY');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeQuickFilter === 'TODAY'
                    ? 'bg-[#4a3b32] text-white shadow-sm'
                    : 'bg-white text-[#4a3b32] border border-[#ebdxc8] hover:bg-stone-50 transition-colors'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate(getFirstDayOfMonthString());
                  setEndDate(getLastDayOfMonthString());
                  setActiveQuickFilter('MONTH');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeQuickFilter === 'MONTH'
                    ? 'bg-[#4a3b32] text-white shadow-sm'
                    : 'bg-white text-[#4a3b32] border border-[#ebdxc8] hover:bg-stone-50 transition-colors'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setActiveQuickFilter('ALL');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeQuickFilter === 'ALL'
                    ? 'bg-[#4a3b32] text-white shadow-sm'
                    : 'bg-white text-[#4a3b32] border border-[#ebdxc8] hover:bg-stone-50 transition-colors'
                }`}
              >
                Semua Waktu
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada transaksi
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium text-right">Pemasukan</th>
                  <th className="px-6 py-4 font-medium text-right">Pengeluaran</th>
                  <th className="px-6 py-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#ebdxc8] last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      {t.type === 'IN' ? formatIDR(t.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">
                      {t.type === 'OUT' ? formatIDR(t.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(t.type === 'OUT', t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="p-6 border-b border-[#f4ecd8] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#4a3b32]">
                {editingId ? 'Edit' : 'Tambah'} {isKasKeluar ? 'Pengeluaran' : 'Pemasukan'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-[#f4ecd8] rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45 text-[#4a3b32]" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={isKasKeluar ? "Contoh: Beli bahan baku" : "Contoh: Modal awal"}
                    className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#ebdxc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a485] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#ebdxc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a485] transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 text-white ${
                      isKasKeluar 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                        : 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                    }`}
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#4a3b32] mb-2">Hapus Transaksi?</h2>
            <p className="text-gray-500 mb-6 font-sans">
              Transaksi ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={cancelDelete}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
