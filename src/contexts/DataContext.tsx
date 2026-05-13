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

interface DataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sliders: SliderImage[];
  setSliders: React.Dispatch<React.SetStateAction<SliderImage[]>>;
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
    price: 100000, 
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

  useEffect(() => {
    localStorage.setItem('tiffany_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tiffany_sliders', JSON.stringify(sliders));
  }, [sliders]);

  return (
    <DataContext.Provider value={{ products, setProducts, sliders, setSliders }}>
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
