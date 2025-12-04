import { useState, useEffect } from 'react';
import { Car } from '../App';
import { Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPageSettings } from './PageEditor';

interface CarSelectionProps {
  onNext: (car: Car) => void;
  selectedCar?: Car;
}

export function CarSelection({ onNext, selectedCar }: CarSelectionProps) {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setCars(settings.cars);
    };
    loadSettings();
  }, []);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-slate-900 mb-2">Select Your Test Drive Vehicle</h2>
        <p className="text-slate-600">Choose from our premium collection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <button
            key={car.id}
            onClick={() => onNext(car)}
            className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 text-left transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${selectedCar?.id === car.id
                ? 'border-blue-500 shadow-xl ring-4 ring-blue-100'
                : 'border-slate-200 hover:border-blue-400 shadow-md'
              }`}
          >
            {selectedCar?.id === car.id && (
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                <Check className="w-5 h-5" strokeWidth={3} />
              </div>
            )}
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
              <ImageWithFallback
                src={car.image}
                alt={`${car.name} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-5">
              <h3 className="text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">{car.name}</h3>
              <p className="text-slate-600 mb-3">{car.model}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-200">{car.type}</span>
                <span className="text-slate-500">{car.year}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}