import React, { useState } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Edit2 } from 'lucide-react';
import { useData, SliderImage } from '../../contexts/DataContext';
import { formatImageUrl } from '../../utils/formatImage';

export default function Settings() {
  const { sliders, setSliders, appScriptUrl, setAppScriptUrl } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderImage | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    subtitle: ''
  });

  const handleOpenModal = (slider?: SliderImage) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        imageUrl: slider.imageUrl,
        title: slider.title || '',
        subtitle: slider.subtitle || ''
      });
    } else {
      setEditingSlider(null);
      setFormData({
        imageUrl: '',
        title: '',
        subtitle: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlider) {
      setSliders(sliders.map(s => 
        s.id === editingSlider.id ? { ...s, ...formData } : s
      ));
    } else {
      const newId = sliders.length > 0 ? Math.max(...sliders.map(s => s.id)) + 1 : 1;
      setSliders([...sliders, { ...formData, id: newId }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus gambar slider ini?')) {
      setSliders(sliders.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4a3b32]">Pengaturan Web</h1>
          <p className="text-[#8c7b70] text-sm mt-1">Kelola konten halaman utama seperti Hero Slider.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#c4a485] hover:bg-[#b09072] text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Tambah Slide
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ebdxc8] p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#4a3b32] mb-4 border-b border-gray-100 pb-4">Integrasi Google Sheets</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Hubungkan Aplikasi dengan Google Sheets untuk mencatat otomatis setiap mutasi kas (Buku Kas & POS Penjualan).
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Google App Script Extension URL</label>
            <input
              type="url"
              value={appScriptUrl}
              onChange={(e) => setAppScriptUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none"
              placeholder="https://script.google.com/macros/s/..."
            />
          </div>
          <div className="mt-2 text-xs text-green-600">
            * Data disimpan secara otomatis saat diketik.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ebdxc8] p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#4a3b32] mb-4 border-b border-gray-100 pb-4">Daftar Hero Slider Aktif</h2>
        
        {sliders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            Belum ada slider yang aktif. Silakan tambah gambar slider.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map(slider => (
              <div key={slider.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-[16/9] w-full">
                  <img 
                    src={formatImageUrl(slider.imageUrl)} 
                    alt={slider.title || 'Slider image'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f3f4f6/a8a29e?text=No+Image";
                    }}
                  />
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-sm text-[#4a3b32] truncate">{slider.title || 'Tanpa Judul'}</h3>
                  <p className="text-xs text-[#8c7b70] truncate mt-1">{slider.subtitle || '-'}</p>
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(slider)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-blue-50 text-blue-600 p-2 rounded-lg shadow-md transition-colors"
                    title="Edit slide ini"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slider.id)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 p-2 rounded-lg shadow-md transition-colors"
                    title="Hapus slide ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-[#4a3b32]">
                {editingSlider ? 'Edit Hero Slide' : 'Tambah Hero Slide'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Gambar</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Direkomendasikan rasio 16:9 dan resolusi tinggi (contoh: dari Unsplash)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Headline Judul (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none resize-none"
                  placeholder="The Taste of..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub-headline (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none resize-none"
                  placeholder="Sempurnakan momen..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4a3b32] hover:bg-[#342a23] text-white rounded-xl font-medium shadow-sm transition-colors"
                >
                  {editingSlider ? 'Simpan Perubahan' : 'Simpan Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
