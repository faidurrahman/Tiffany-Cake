import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageScale?: number;
  imagePosition?: {
    x: number;
    y: number;
  };
  imageCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  appScriptUrl: string;
  setAppScriptUrl: React.Dispatch<React.SetStateAction<string>>;
}

const DEFAULT_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'Original Pie', 
    price: 120000, 
    description: 'Pie susu klasik dengan kulit renyah dan isian susu yang lembut dan manis sempurna.',
    imageUrl: 'https://lh3.googleusercontent.com/d/1vpgMVUE0bVwZ5RePdvOZY8qdcmvSFFAP'
  },
  { 
    id: 2, 
    name: 'Cheese Pie', 
    price: 140000, 
    description: 'Sensasi gurih keju premium dipadukan dengan manisnya pie, menciptakan rasa yang kaya.',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 3, 
    name: 'Lotus Biscoff Pie', 
    price: 155000, 
    description: 'Lelehan selai Lotus Biscoff asli dengan taburan biskuit renyah di atas cantiknya pie susu.',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 4, 
    name: 'Mixed Fruit Pie', 
    price: 210000, 
    description: 'Topping buah-buahan segar pilihan yang memberikan sensasi segar pada setiap gigitan.',
    imageUrl: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 5, 
    name: 'SilverQueen Pie', 
    price: 150000, 
    description: 'Taburan cokelat SilverQueen yang melimpah, favorit para pecinta cokelat kacang.',
    imageUrl: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Lotus & Cheese Mix Pie',
    price: 150000,
    description: 'Perpaduan sempurna antara renyahnya Lotus Biscoff dan gurihnya Premium Cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 7,
    name: 'SilverQueen & Cheese Mix Pie',
    price: 155000,
    description: 'Manisnya cokelat SilverQueen berpadu dengan keju gurih dalam satu pan pie yang lezat.',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 8,
    name: 'Original & Cheese Mix Pie',
    price: 145000,
    description: 'Setengah pie susu original klasik dan setengah pie keju premium untuk yang suka keduanya.',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 9, 
    name: 'Marble Cake', 
    price: 85000, 
    description: 'Bolu klasik dengan motif marmer cokelat vanilla yang moist dan wangi mentega.',
    imageUrl: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=600&auto=format&fit=crop'
  },
];

const DEFAULT_SLIDERS: SliderImage[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1557925923-33b25dd8beb6?q=80&w=1200&auto=format&fit=crop',
    title: 'The Taste of Premium Elegance',
    subtitle: 'Sempurnakan setiap momen berharga Anda bersama keluarga dengan Tiffany Cake.'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=1200&auto=format&fit=crop',
    title: 'Freshly Baked Everyday',
    subtitle: 'Bahan premium dan berkualitas dalam setiap layanannya.'
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tiffany_products');
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      // Merge missing items from DEFAULT_PRODUCTS
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
    return localStorage.getItem('tiffany_appscript_url') || 'https://script.google.com/macros/s/AKfycbzlbCL0vlU4nCW2VGW2M9WU254sjBCDWSujgefGFptTQftCQDeVzY9jNVV9FANU5AYC/exec';
  });

  const syncFromSheets = async () => {
    const currentAppScriptUrl = import.meta.env.VITE_APPSCRIPT_URL || appScriptUrl;
    if (!currentAppScriptUrl) return;

    try {
      const res = await fetch(currentAppScriptUrl);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedData = data.map((item: any) => ({
          id: Number(item.id),
          date: new Date(Number(item.id)).toISOString(),
          description: item.description || '',
          amount: Number(item.amount) || 0,
          type: item.type === 'IN' ? 'IN' : 'OUT'
        }));
        
        // Urutkan dari yang terbaru
        formattedData.sort((a, b) => b.id - a.id);
        setTransactions(formattedData);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dari Google Sheets", err);
    }
  };

  useEffect(() => {
    syncFromSheets();
  }, [appScriptUrl]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Date.now(),
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Opsi: Kirim ke Google Sheets lewat Apps Script
    // Menggunakan appScriptUrl dari pengaturan pengguna jika VITE_APPSCRIPT_URL tidak ada
    const currentAppScriptUrl = import.meta.env.VITE_APPSCRIPT_URL || localStorage.getItem('tiffany_appscript_url');
    if (currentAppScriptUrl) {
      try {
        const payload = {
          action: 'add',
          id: newTransaction.id,
          tanggal: new Date(newTransaction.date).toLocaleString('id-ID'),
          keterangan: newTransaction.description,
          pemasukan: newTransaction.type === 'IN' ? newTransaction.amount : 0,
          pengeluaran: newTransaction.type === 'OUT' ? newTransaction.amount : 0
        };
        fetch(currentAppScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload)
        }).catch(err => console.error("Gagal sinkronisasi dengan Google Sheets:", err));
      } catch (err) {
        console.error("AppScript Error:", err);
      }
    }
  };

  const updateTransaction = (id: number, t: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => {
      const existing = prev.find(item => item.id === id);
      if (!existing) return prev;
      
      const updated = { ...existing, ...t };
      
      const currentAppScriptUrl = import.meta.env.VITE_APPSCRIPT_URL || localStorage.getItem('tiffany_appscript_url');
      if (currentAppScriptUrl) {
        try {
          const payload = {
            action: 'update',
            id: updated.id,
            tanggal: new Date(updated.date).toLocaleString('id-ID'),
            keterangan: updated.description,
            pemasukan: updated.type === 'IN' ? updated.amount : 0,
            pengeluaran: updated.type === 'OUT' ? updated.amount : 0
          };
          fetch(currentAppScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
          }).catch(err => console.error(err));
        } catch (err) {
          console.error(err);
        }
      }
      
      return prev.map(item => item.id === id ? updated : item);
    });
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    
    const currentAppScriptUrl = import.meta.env.VITE_APPSCRIPT_URL || localStorage.getItem('tiffany_appscript_url');
    if (currentAppScriptUrl) {
      try {
        const payload = {
          action: 'delete',
          id: id
        };
        fetch(currentAppScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        }).catch(err => console.error("Gagal sinkronisasi dengan Google Sheets:", err));
      } catch (err) {
        console.error("AppScript Error:", err);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('tiffany_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tiffany_sliders', JSON.stringify(sliders));
  }, [sliders]);

  useEffect(() => {
    localStorage.setItem('tiffany_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tiffany_appscript_url', appScriptUrl);
  }, [appScriptUrl]);

  return (
    <DataContext.Provider value={{
      products,
      setProducts,
      sliders,
      setSliders,
      transactions,
      setTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      appScriptUrl,
      setAppScriptUrl
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
