import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Minus, Trash2, Download, Loader2, CheckCircle, AlertCircle, Lock, User, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useData, Product } from '../../contexts/DataContext';

interface CartItem extends Product {
  qty: number;
}

const formatIDR = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0 }).replace(/,/g, '.');
};

export default function POS() {
  const { products, addTransaction } = useData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [dateStr, setDateStr] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setDateStr(date.toLocaleDateString('id-ID', options).toUpperCase());
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSavePDF = async () => {
    if (!receiptRef.current) return;
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      const element = receiptRef.current;
      
      const originalScrollY = window.scrollY;
      
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      
      window.scrollTo({ top: originalScrollY, behavior: 'auto' });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Ukuran struk tidak valid (0px)');
      }

      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = canvas.width / 2;
      const pdfHeight = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tiffany-Cake-Receipt-${new Date().getTime()}.pdf`);
      
      const totalItems = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const grandTotal = totalItems + shippingFee;

      const itemNames = cart.map(item => item.name).join(', ');

      // Add transaction record
      addTransaction({
        description: `Nota Penjualan - [${itemNames}] ${shippingFee > 0 ? '(Termasuk Ongkir)' : ''}`.trim(),
        amount: grandTotal,
        type: 'IN'
      });

      // Clear cart
      setCart([]);
      setShippingFee(0);

      showToast('Struk berhasil diunduh & dicatat ke kas!', 'success');
    } catch (error) {
      console.error('Error saving PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      showToast(`Gagal menyimpan: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = totalItems + shippingFee;

  return (
    <div className="font-sans pb-40 print:pb-0 print:bg-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-4 ${toastMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm whitespace-nowrap">{toastMessage.text}</span>
        </div>
      )}

      <main className="p-4 max-w-lg mx-auto print:hidden">
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform text-left flex flex-col justify-center min-h-[80px]"
            >
              <span className="text-sm font-medium text-gray-800 mb-1 leading-tight">{product.name}</span>
              <span className="text-xs text-blue-600 font-semibold">{formatIDR(product.price)}</span>
            </button>
          ))}
        </div>

        {/* Current Order */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">Current Order</h2>
          
          <div className="space-y-4 mb-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-6 text-sm">Belum ada pesanan</div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex flex-col gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="font-semibold text-gray-800">{formatIDR(item.price * item.qty)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{formatIDR(item.price)} / item</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full active:scale-95 text-gray-600">
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full active:scale-95 text-gray-600">
                        <Plus className="w-5 h-5" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-full active:scale-95 text-red-500 ml-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ongkos Kirim Input */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-600 mb-2">Ongkos Kirim</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input
                type="number"
                value={shippingFee || ''}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 z-20 print:hidden">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 font-medium">Total Pembayaran</span>
            <span className="text-2xl font-bold text-gray-800">{formatIDR(grandTotal)}</span>
          </div>
          <button
            onClick={handleSavePDF}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isSaving ? 'Menyimpan PDF...' : 'Download Struk (PDF)'}
          </button>
        </div>
      </div>

      {/* Receipt Preview - Visible when printing */}
      <div className="w-full bg-[#e5e5e5] p-8 flex justify-center items-start print:w-full print:p-0 print:bg-white print:overflow-visible">
        
        {/* The actual receipt to be captured */}
        <div ref={receiptRef} className="w-[280px] drop-shadow-xl flex flex-col print:shadow-none print:w-full print:max-w-[300px] print:mx-auto">
          
          {/* Top ZigZag */}
          <div className="h-[6px] w-full" style={{
            background: 'linear-gradient(135deg, transparent 50%, #f4f4f5 50%) left top / 12px 100% repeat-x, linear-gradient(225deg, transparent 50%, #f4f4f5 50%) left top / 12px 100% repeat-x'
          }}></div>
          
          {/* Main Paper */}
          <div className="bg-[#f4f4f5] px-5 py-5 text-[#111827] flex flex-col">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black tracking-[0.2em] text-[#111827] uppercase text-center">
                TIFFANY CAKE
              </h1>
              <p className="text-xs font-semibold tracking-widest text-[#6b7280] uppercase text-center mt-2">
                {dateStr}
              </p>
            </div>

            {/* Table Header */}
            <div className="flex text-[10px] font-bold tracking-wider text-[#9ca3af] uppercase border-b border-dashed border-[#d1d5db] pb-2 mb-2">
              <div className="w-6 text-left">NO</div>
              <div className="flex-1 text-left">ITEM</div>
              <div className="w-8 text-center">QTY</div>
              <div className="w-20 text-right">HARGA</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col mb-4">
              {cart.map((item, index) => (
                <div key={index} className="flex text-sm font-medium text-[#1f2937] py-3 items-start">
                  <div className="w-6 text-left">{index + 1}</div>
                  <div className="flex-1 pr-2 leading-tight">{item.name}</div>
                  <div className="w-8 text-center">{item.qty}</div>
                  <div className="w-20 text-right">{formatIDR(item.price * item.qty)}</div>
                </div>
              ))}
              
              {/* Ongkos Kirim */}
              {shippingFee > 0 && (
                <div className="flex text-sm font-medium text-[#1f2937] py-3 items-start">
                  <div className="w-6 text-left">{cart.length + 1}</div>
                  <div className="flex-1 pr-2 leading-tight">Ongkos Kirim</div>
                  <div className="w-8 text-center">1</div>
                  <div className="w-20 text-right">{formatIDR(shippingFee)}</div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t border-dashed border-[#d1d5db] mb-4">
              <div className="text-sm font-bold tracking-widest text-[#6b7280] uppercase">TOTAL</div>
              <div className="text-xl font-extrabold text-[#111827]">{formatIDR(grandTotal)}</div>
            </div>

            {/* Payment Info */}
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase mb-2">TRANSFER PEMBAYARAN</p>
              <p className="text-sm font-semibold text-[#374151]">Bank Mandiri</p>
              <p className="font-mono text-lg font-bold text-[#111827] tracking-wider my-1">1520032905586</p>
              <p className="text-xs font-medium text-[#6b7280]">a.n TRIANI PUTERI JATI</p>
            </div>

            {/* Solid divider */}
            <div className="border-t-[1.5px] border-[#1f2937] mb-6"></div>

            {/* Footer */}
            <div className="text-center flex flex-col items-center">
              <div className="text-[28px] mb-1 text-[#1a1a1a]" style={{ fontFamily: "'Caveat', cursive" }}>
                Terima kasih
              </div>
              
              {/* Heart Decoration */}
              <div className="flex items-center justify-center mb-5 text-[#1f2937]">
                <svg width="100" height="18" viewBox="0 0 140 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10,12 Q35,14 60,12" />
                  <path d="M60,12 C55,4 65,0 70,8 C75,0 85,4 80,12 C75,18 70,20 70,20 C70,20 65,18 60,12 Z" />
                  <path d="M80,12 Q105,14 130,12" />
                </svg>
              </div>
              
              <div className="text-[11px] font-medium tracking-widest text-[#1a1a1a]">
                — Tiffany Cake —
              </div>
            </div>

          </div>

          {/* Bottom ZigZag */}
          <div className="h-[6px] w-full" style={{
            background: 'linear-gradient(45deg, transparent 50%, #f4f4f5 50%) left bottom / 12px 100% repeat-x, linear-gradient(315deg, transparent 50%, #f4f4f5 50%) left bottom / 12px 100% repeat-x'
          }}></div>

        </div>
      </div>
    </div>
  );
}
