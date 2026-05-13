import React from 'react';
import { formatImageUrl } from '../utils/formatImage';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageScale?: number;
  imagePosition?: { x: number; y: number };
  imageCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const formatIDR = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0 }).replace(/,/g, '.');
};

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ name, price, description, imageUrl, imageScale, imagePosition, imageCrop }, ref) => {
    return (
      <div ref={ref} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#f4ecd8] flex flex-col h-full">
        <div className="aspect-[4/3] overflow-hidden bg-[#fdfbf7] relative">
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out absolute inset-0">
            {imageCrop ? (
              <img 
                src={formatImageUrl(imageUrl)} 
                alt={name} 
                className="max-w-none"
                style={{
                  position: 'absolute',
                  width: `${(100 / imageCrop.width) * 100}%`,
                  height: `${(100 / imageCrop.height) * 100}%`,
                  left: `-${(imageCrop.x / imageCrop.width) * 100}%`,
                  top: `-${(imageCrop.y / imageCrop.height) * 100}%`,
                  display: 'block'
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <img 
                src={formatImageUrl(imageUrl)} 
                alt={name} 
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${imagePosition?.x ?? 50}% ${imagePosition?.y ?? 50}%`,
                  transform: `scale(${imageScale ?? 1})`
                }}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-semibold text-[#4a3b32] mb-2">{name}</h3>
          <p className="text-[#8c7b70] text-sm flex-1 mb-4 leading-relaxed">{description}</p>
          <div className="text-lg font-bold text-[#c4a485]">
            {formatIDR(price)}
          </div>
        </div>
      </div>
    );
  }
);
export default ProductCard;
