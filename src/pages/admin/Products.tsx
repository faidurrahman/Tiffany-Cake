import React, { useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useData, Product } from '../../contexts/DataContext';
import { formatImageUrl } from '../../utils/formatImage';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop'
  });

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const onCropComplete = useCallback((croppedAreaPercentages: any, _croppedAreaPixels: any) => {
    // react-easy-crop's first argument is croppedArea (percentages), second is croppedAreaPixels (pixels)
    setCroppedArea(croppedAreaPercentages);
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        imageUrl: product.imageUrl
      });
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(product.imageCrop || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop'
      });
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formData.price.replace(/\D/g, ''), 10) || 0;
    
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        price: priceNum,
        imageCrop: croppedArea || undefined
      });
    } else {
      addProduct({
        ...formData,
        price: priceNum,
        imageCrop: croppedArea || undefined
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
    }
  };

  const formatIDR = (amount: number) => {
    return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0 }).replace(/,/g, '.');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3b32]">Kelola Produk</h1>
          <p className="text-[#8c7b70] text-xs md:text-sm mt-0.5 md:mt-1">Tambah, edit, atau hapus produk dari katalog.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#c4a485] hover:bg-[#b09072] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 md:w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e8dfc8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fdfbf7] border-b border-[#e8dfc8] text-[#8c7b70] text-xs md:text-sm">
                <th className="p-3 md:p-4 font-medium">Gambar</th>
                <th className="p-3 md:p-4 font-medium">Nama Produk</th>
                <th className="p-3 md:p-4 font-medium">Harga</th>
                <th className="p-3 md:p-4 font-medium hidden md:table-cell">Deskripsi</th>
                <th className="p-3 md:p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[#ebdxc8] last:border-0 hover:bg-stone-50/50 transition-colors group">
                  <td className="p-3 md:p-4">
                    <img 
                      src={formatImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-100 placeholder-pulse"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/200x200/f3f4f6/a8a29e?text=No+Image";
                      }}
                    />
                  </td>
                  <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-[#4a3b32]">{product.name}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm text-[#c4a485] font-semibold md:font-bold">{formatIDR(product.price)}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm text-[#8c7b70] hidden md:table-cell max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 md:gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-xs md:text-sm">
                    Tidak ada produk. Silakan tambah produk baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-[#4a3b32]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none"
                  placeholder="Contoh: Marble Cake"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp)</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, price: val});
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none"
                  placeholder="Contoh: 150000"
                />
              </div>

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
                  Gunakan URL gambar publik (Unsplash, dll) atau link Google Drive.
                </div>

                {formData.imageUrl && (
                  <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Atur Area Gambar (Crop & Pan)</label>
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <Cropper
                        image={formatImageUrl(formData.imageUrl)}
                        crop={crop}
                        zoom={zoom}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    </div>
                    <div className="mt-4 px-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Zoom Out</span>
                        <span>Zoom In</span>
                      </div>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c4a485]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c4a485] focus:bg-white transition-colors outline-none resize-none"
                  placeholder="Deskripsikan keistimewaan kue ini..."
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
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
