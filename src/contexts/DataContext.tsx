import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageScale?: number;
  imagePosition?: { x: number; y: number; };
  imageCrop?: { x: number; y: number; width: number; height: number; };
}

export interface SliderImage {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'IN' | 'OUT';
  amount: number;
}

interface DataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sliders: SliderImage[];
  setSliders: React.Dispatch<React.SetStateAction<SliderImage[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (id: number, transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  appScriptUrl: string;
  setAppScriptUrl: React.Dispatch<React.SetStateAction<string>>;
  syncFromSheets: () => Promise<void>;
  isSyncing: boolean;
  syncError: string | null;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Original Pie', price: 120000, description: 'Pie susu klasik dengan kulit renyah dan isian susu yang lembut dan manis sempurna.', imageUrl: 'https://lh3.googleusercontent.com/d/1vpgMVUE0bVwZ5RePdvOZY8qdcmvSFFAP' },
  { id: 2, name: 'Cheese Pie', price: 140000, description: 'Sensasi gurih keju premium dipadukan dengan manisnya pie, menciptakan rasa yang kaya.', imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=600&auto=format&fit=crop' },
  { id: 3, name: 'Lotus Biscoff Pie', price: 155000, description: 'Lelehan selai Lotus Biscoff asli dengan taburan biskuit renyah di atas cantiknya pie susu.', imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=600&auto=format&fit=crop' },
  { id: 4, name: 'Mixed Fruit Pie', price: 210000, description: 'Topping buah-buahan segar pilihan yang memberikan sensasi segar pada setiap gigitan.', imageUrl: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?q=80&w=600&auto=format&fit=crop' },
  { id: 5, name: 'SilverQueen Pie', price: 150000, description: 'Taburan cokelat SilverQueen yang melimpah, favorit para pecinta cokelat kacang.', imageUrl: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=600&auto=format&fit=crop' },
  { id: 6, name: 'Lotus & Cheese Mix Pie', price: 150000, description: 'Perpaduan sempurna antara renyahnya Lotus Biscoff dan gurihnya Premium Cheese.', imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=600&auto=format&fit=crop' },
  { id: 7, name: 'SilverQueen & Cheese Mix Pie', price: 155000, description: 'Manisnya cokelat SilverQueen berpadu dengan keju gurih dalam satu pan pie yang lezat.', imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=600&auto=format&fit=crop' },
  { id: 8, name: 'Original & Cheese Mix Pie', price: 145000, description: 'Setengah pie susu original klasik dan setengah pie keju premium untuk yang suka keduanya.', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop' },
  { id: 9, name: 'Marble Cake', price: 85000, description: 'Bolu klasik dengan motif marmer cokelat vanilla yang moist dan wangi mentega.', imageUrl: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=600&auto=format&fit=crop' },
];

const DEFAULT_SLIDERS: SliderImage[] = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1557925923-33b25dd8beb6?q=80&w=1200&auto=format&fit=crop', title: 'The Taste of Premium Elegance', subtitle: 'Sempurnakan setiap momen berharga Anda bersama keluarga dengan Tiffany Cake.' },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=1200&auto=format&fit=crop', title: 'Freshly Baked Everyday', subtitle: 'Bahan premium dan berkualitas dalam setiap layanannya.' }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tiffany_products');
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_PRODUCTS.forEach(dp => {
        if (!merged.find(p => p.id === dp.id)) {
          merged.push(dp);
        }
      });
      return merged.sort((a, b) => a.id - b.id);
    }
    return DEFAULT_PRODUCTS;
  });

  const [sliders, setSliders] = useState<SliderImage[]>(() => {
    const saved = localStorage.getItem('tiffany_sliders');
    return saved ? JSON.parse(saved) : DEFAULT_SLIDERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tiffany_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [appScriptUrl, setAppScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem('tiffany_appscript_url');
    // Jika Anda punya URL Web App yang baru, pastikan ter-update di sini:
    const NEW_URL = 'https://script.google.com/macros/s/AKfycbz-Z5T2kLAFdqaHGZUtjy6M3QXy7EUSnpD8xDzKMMxAhj53oUI7IcMSAtqNmpUaJCFp2A/exec';
    
    if (!saved || saved.includes('AKfycb')) {
      localStorage.setItem('tiffany_appscript_url', NEW_URL);
      return NEW_URL;
    }
    return saved;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const getValidAppScriptUrl = () => {
    // KITA KUNCI MATI URL-NYA DI SINI
    // Abaikan localStorage, abaikan .env, abaikan proxy AI
    return 'https://script.google.com/macros/s/AKfycbz-Z5T2kLAFdqaHGZUtjy6M3QXy7EUSnpD8xDzKMMxAhj53oUI7IcMSAtqNmpUaJCFp2A/exec';
  };

  // Sinkronisasi khusus Produk (Sheet 2)
  const syncProductsFromSheets = async () => {
    const targetUrl = getValidAppScriptUrl();
    if (!targetUrl) return;

    try {
      const timestamp = Date.now();
      let productData: any = null;

      // 1. Coba fetch lewat proxy server-side terlebih dahulu (bypass CORS di sandbox iframe)
      try {
        const proxyUrl = `/api/sync-sheets?url=${encodeURIComponent(`${targetUrl}?type=products&_cb=${timestamp}`)}`;
        console.log("Sinkronisasi produk via Proxy...");
        const res = await fetch(proxyUrl);
        if (res.ok) {
          productData = await res.json();
          console.log("Sync produk via Proxy berhasil.");
        } else {
          console.warn("Proxy produk mengembalikan status non-ok:", res.status);
        }
      } catch (proxyErr) {
        console.warn("Proxy produk gagal atau tidak terjangkau, beralih ke direct fetch...", proxyErr);
      }

      // 2. Direct fallback jika proxy gagal
      if (!productData) {
        console.log("Mulai sinkronisasi produk secara langsung...");
        const res = await fetch(`${targetUrl}?type=products&_cb=${timestamp}`, {
          method: 'GET',
          redirect: 'follow'
        });
        if (!res.ok) throw new Error(`Fetch produk gagal dengan status ${res.status}`);
        productData = await res.json();
      }
      
      if (Array.isArray(productData) && productData.length > 0) {
        const formattedProducts = productData.map((item: any) => {
          let cropObj = undefined;
          if (item.imageCrop) {
            try { cropObj = typeof item.imageCrop === 'string' ? JSON.parse(item.imageCrop) : item.imageCrop; } 
            catch (e) { console.warn("Gagal parse imageCrop"); }
          }
          return {
            id: Number(item.id) || Date.now(),
            name: item.name || item.nama || '',
            price: Number(item.price) || Number(item.harga) || 0,
            description: item.description || item.deskripsi || '',
            imageUrl: item.imageUrl || item.image || item.gambar || '',
            imageCrop: cropObj
          };
        });
        setProducts(formattedProducts);
        console.log("Sukses update state Produk:", formattedProducts.length, "item.");
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data produk dari Sheets:", err);
    }
  };

  // Sinkronisasi Transaksi & Buku Kas (Sheet 1)
  const syncFromSheets = async () => {
    const targetUrl = getValidAppScriptUrl();
    if (!targetUrl) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const timestamp = Date.now();
      let data: any = null;

      // 1. Coba fetch lewat proxy server-side terlebih dahulu (bypass CORS di sandbox iframe)
      try {
        const proxyUrl = `/api/sync-sheets?url=${encodeURIComponent(`${targetUrl}?_cb=${timestamp}`)}`;
        console.log("Sinkronisasi transaksi via Proxy...");
        const res = await fetch(proxyUrl);
        if (res.ok) {
          data = await res.json();
          console.log("Sync transaksi via Proxy berhasil.");
        } else {
          console.warn("Proxy transaksi mengembalikan status non-ok:", res.status);
          const errorInfo = await res.json().catch(() => ({}));
          if (errorInfo.message) {
            throw new Error(`Google Sheets Exception: ${errorInfo.message}`);
          }
        }
      } catch (proxyErr: any) {
        console.warn("Proxy transaksi gagal, beralih ke direct fetch...", proxyErr);
        if (proxyErr.message && proxyErr.message.includes("Google Sheets Exception")) {
          throw proxyErr;
        }
      }

      // 2. Direct fallback jika proxy gagal
      if (!data) {
        console.log("Mulai sinkronisasi transaksi secara langsung...");
        const res = await fetch(`${targetUrl}?_cb=${timestamp}`, {
          method: 'GET',
          redirect: 'follow'
        });
        if (!res.ok) throw new Error(`Gagal terhubung ke server. Status: ${res.status}`);
        data = await res.json();
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          setTransactions([]);
        } else {
          const formattedData = data.map((item: any, index: number) => {
            let type = 'IN';
            let amount = 0;
            let pemasukan = Number(item.pemasukan) || 0;
            let pengeluaran = Number(item.pengeluaran) || 0;
            
            if (pemasukan > 0) { type = 'IN'; amount = pemasukan; } 
            else if (pengeluaran > 0) { type = 'OUT'; amount = pengeluaran; }

            let timestampId = Number(item.id);
            if (!timestampId || isNaN(timestampId) || timestampId === 0) {
              timestampId = new Date(item.tanggal || Date.now()).getTime() + index;
            }

            return {
              id: timestampId,
              date: new Date(timestampId).toISOString(),
              description: item.keterangan || '',
              amount: amount,
              type: type as 'IN' | 'OUT'
            };
          });
          
          formattedData.sort((a, b) => b.id - a.id);
          setTransactions(formattedData);
          console.log("Sukses update state Transaksi:", formattedData.length, "item.");
        }
      }

      // Selalu panggil update produk setelah update transaksi selesai
      await syncProductsFromSheets();

    } catch (err: any) {
      console.error("Gagal sinkronisasi dari Sheets:", err);
      setSyncError(err.message || String(err));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncFromSheets();
  }, [appScriptUrl]);

  // Fungsi khusus untuk menulis (POST) data secara langsung dengan aman
  const sendWriteRequest = async (targetUrl: string, payload: any) => {
    // 1. Coba kirim data lewat proxy server-side (sangat handal & aman dari CORS)
    try {
      console.log("Mengirim data via Proxy...", payload.action);
      const res = await fetch('/api/proxy-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          payload
        })
      });
      if (res.ok) {
        const result = await res.json().catch(() => ({}));
        if (result.success) {
          console.log("Kirim/update data via Proxy sukses:", result.response);
          return;
        }
      }
    } catch (err) {
      console.warn("Proxy write gagal, mencoba direct write fallback...", err);
    }

    // 2. Direct fallback jika proxy gagal
    try {
      console.log("Mengirim data langsung ke server...", payload.action);
      await fetch(targetUrl, {
        method: 'POST',
        redirect: 'follow', // Wajib Follow
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Wajib text/plain bypass CORS
        },
        body: JSON.stringify(payload)
      });
      console.log("Sukses mengeksekusi langsung:", payload.action);
    } catch (err) {
      console.error("Gagal sinkronisasi data ke Sheets:", err);
    }
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = { ...t, id: Date.now(), date: new Date().toISOString() };
    setTransactions(prev => [newTransaction, ...prev]);

    const targetUrl = getValidAppScriptUrl();
    if (targetUrl) {
      const payload = {
        action: 'add',
        id: newTransaction.id,
        tanggal: new Date(newTransaction.date).toLocaleDateString('id-ID'),
        keterangan: newTransaction.description,
        pemasukan: newTransaction.type === 'IN' ? newTransaction.amount : 0,
        pengeluaran: newTransaction.type === 'OUT' ? newTransaction.amount : 0
      };
      sendWriteRequest(targetUrl, payload);
    }
  };

  const updateTransaction = (id: number, t: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => {
      const existing = prev.find(item => item.id === id);
      if (!existing) return prev;
      
      const updated = { ...existing, ...t };
      const targetUrl = getValidAppScriptUrl();
      
      if (targetUrl) {
        const payload = {
          action: 'update',
          id: updated.id,
          tanggal: new Date(updated.date).toLocaleDateString('id-ID'),
          keterangan: updated.description,
          pemasukan: updated.type === 'IN' ? updated.amount : 0,
          pengeluaran: updated.type === 'OUT' ? updated.amount : 0
        };
        sendWriteRequest(targetUrl, payload);
      }
      return prev.map(item => item.id === id ? updated : item);
    });
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    const targetUrl = getValidAppScriptUrl();
    if (targetUrl) {
      sendWriteRequest(targetUrl, { action: 'delete', id: id });
    }
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(prod => prod.id)) + 1 : 1;
    const newProduct: Product = { ...p, id: newId };
    setProducts(prev => [...prev, newProduct]);

    const targetUrl = getValidAppScriptUrl();
    if (targetUrl) {
      const payload = {
        action: 'add_product',
        id: newProduct.id,
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl,
        imageCrop: newProduct.imageCrop ? JSON.stringify(newProduct.imageCrop) : ""
      };
      sendWriteRequest(targetUrl, payload);
    }
  };

  const updateProduct = (id: number, p: Partial<Product>) => {
    setProducts(prev => {
      const existing = prev.find(prod => prod.id === id);
      if (!existing) return prev;
      const updated = { ...existing, ...p };

      const targetUrl = getValidAppScriptUrl();
      if (targetUrl) {
        const payload = {
          action: 'update_product',
          id: updated.id,
          name: updated.name,
          price: updated.price,
          description: updated.description,
          imageUrl: updated.imageUrl,
          imageCrop: updated.imageCrop ? JSON.stringify(updated.imageCrop) : ""
        };
        sendWriteRequest(targetUrl, payload);
      }
      return prev.map(prod => prod.id === id ? updated : prod);
    });
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
    const targetUrl = getValidAppScriptUrl();
    if (targetUrl) {
      sendWriteRequest(targetUrl, { action: 'delete_product', id: id });
    }
  };

  useEffect(() => { localStorage.setItem('tiffany_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('tiffany_sliders', JSON.stringify(sliders)); }, [sliders]);
  useEffect(() => { localStorage.setItem('tiffany_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('tiffany_appscript_url', appScriptUrl); }, [appScriptUrl]);

  return (
    <DataContext.Provider value={{
      products, setProducts, sliders, setSliders, transactions, setTransactions,
      addTransaction, updateTransaction, deleteTransaction, addProduct, updateProduct, deleteProduct,
      appScriptUrl, setAppScriptUrl, syncFromSheets, isSyncing, syncError
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};