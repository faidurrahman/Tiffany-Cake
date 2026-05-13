import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../../components/ProductCard';
import { useData } from '../../contexts/DataContext';
import { formatImageUrl } from '../../utils/formatImage';

export default function Home() {
  const { products, sliders } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [sliders]);

  return (
    <div className="w-full">
      {/* Hero Section Dynamic Slider */}
      <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden bg-[#fdfbf7]">
        <AnimatePresence mode="wait">
          {sliders.length > 0 ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url('${formatImageUrl(sliders[currentSlide].imageUrl)}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {sliders.length > 0 && sliders[currentSlide] && (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-3xl"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {sliders[currentSlide].title?.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < (sliders[currentSlide].title?.split('\n').length || 1) - 1 && <br />}
                    </React.Fragment>
                  )) || 'The Taste of Premium Elegance'}
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-light">
                  {sliders[currentSlide].subtitle || 'Sempurnakan setiap momen berharga Anda bersama keluarga dengan Tiffany Cake.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <a href="#menu" className="inline-block bg-[#c4a485] hover:bg-[#b09072] text-white px-8 py-4 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Lihat Menu Kami
          </a>
        </div>

        {/* Slider Indicators */}
        {sliders.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Catalog Section */}
      <section id="menu" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#c4a485] font-semibold tracking-widest uppercase text-sm mb-2">Pilihan Terbaik</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4a3b32]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Signature Menu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                price={product.price}
                description={product.description}
                imageUrl={product.imageUrl}
                imageScale={product.imageScale}
                imagePosition={product.imagePosition}
                imageCrop={product.imageCrop}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
