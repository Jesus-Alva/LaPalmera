"use client";

import { FaRegCheckCircle } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../../lib/hooks/useTranslation";

const PartyPackageComponent: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para el swipe táctil
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);


  // Efecto para detectar cambios de tamaño
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        let columns = 1;
        if (window.matchMedia("(min-width: 1024px)").matches) columns = 3;
        else if (window.matchMedia("(min-width: 768px)").matches) columns = 2;
        else columns = 1;

        setItemsPerView(columns);
        setItemWidth(containerWidth / columns);
      }
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const packageList = t("inicio.partyPackage.packageList", { returnObjects: true }) as Record<string, any>;
  if (!packageList || typeof packageList !== "object") return null;

  const packages = Object.values(packageList);
  const totalPackages = packages.length;
  const maxIndex = Math.max(0, totalPackages - itemsPerView);

  const safeIndex = Math.min(currentIndex, maxIndex);
  // Durante el arrastre, desactivamos la transición para que sea más fluido
  const translateX = -safeIndex * itemWidth;

  const canPrev = safeIndex > 0;
  const canNext = safeIndex < maxIndex;

  const goPrev = () => {
    if (canPrev) setCurrentIndex(safeIndex - 1);
  };
  const goNext = () => {
    if (canNext) setCurrentIndex(safeIndex + 1);
  };

  // Manejo de eventos táctiles (solo habilitado si itemsPerView === 1, es decir móvil)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (itemsPerView !== 1) return; // Solo en móvil (1 tarjeta)
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (itemsPerView !== 1 || touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
    // Pequeño feedback: podríamos mover el carrusel ligeramente, pero no es necesario
  };

  const handleTouchEnd = () => {
    if (itemsPerView !== 1 || touchStart === null || touchEnd === null) {
      setIsDragging(false);
      setTouchStart(null);
      return;
    }
    const distance = touchEnd - touchStart;
    const minSwipeDistance = 50; // umbral mínimo en px
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && canPrev) {
        goPrev(); // deslizar derecha -> anterior
      } else if (distance < 0 && canNext) {
        goNext(); // deslizar izquierda -> siguiente
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const getStringValue = (value: string | string[] | undefined): string => {
    if (!value) return "";
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };
  const normalizeArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  return (
    <section className="bg-gray-100 px-4 py-12 md:py-16 my-12 md:my-18.75">
      <div className="container mx-auto">
        <p className="font-manrope font-bold uppercase tracking-widest text-center text-yellow-800 mb-4 text-sm md:text-base">
          {t("inicio.partyPackage.desc")}
        </p>
        <h2 className="font-noto-serif text-3xl md:text-4xl lg:text-5xl font-normal text-center text-gray-800 mb-8 md:mb-12">
          {t("inicio.partyPackage.title")}
        </h2>

        <div
          className="relative overflow-hidden"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex transition-transform duration-500 ease-in-out ${isDragging ? 'duration-0' : ''}`}
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {packages.map((pkgData, idx) => {
              const title = pkgData.title;
              const desc = pkgData.desc;
              const services = pkgData.services as Record<string, string | string[]>;

              const hrs = getStringValue(services.hrs);
              const food = getStringValue(services.food);
              const carpa = getStringValue(services.carpa);
              const ambiente = getStringValue(services.ambiente);
              const parking = getStringValue(services.parking);
              const mobiliario = normalizeArray(services.mobiliario);
              const staff = normalizeArray(services.staff);

              return (
                <div
                  key={idx}
                  className="shrink-0 p-3 md:p-4 "
                  style={{ width: itemWidth ? `${itemWidth}px` : "auto" }}
                >
                  <div className="bg-white border border-gray-200 shadow-md p-4 md:p-6 flex flex-col h-full rounded-xl hover:shadow-lg transition-shadow">
                    <h5 className="text-center md:text-center lg:text-left mb-2 text-2xl md:text-3xl font-noto-serif tracking-wider font-semibold text-secondary">
                      {title}
                    </h5>
                    <p className="text-body font-noto-serif text-sm md:text-base">
                      {desc}
                    </p>

                    <ul className="mt-4 space-y-2 font-manrope text-sm md:text-base flex-grow">
                      {hrs && (
                        <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{hrs}</span>
                        </li>
                      )}
                      {food && (
                        <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{food}</span>
                        </li>
                      )}
                      {carpa && (
                        <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{carpa}</span>
                        </li>
                      )}
                      {mobiliario.map((item, i) => (
                        <li key={`mob-${idx}-${i}`} className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {staff.map((item, i) => (
                        <li key={`staff-${idx}-${i}`} className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {ambiente && (
                        <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{ambiente}</span>
                        </li>
                      )}
                      {parking && (
                        <li className="flex items-start gap-2 hover:bg-gray-100 transition-colors duration-300 p-1 rounded">
                          <FaRegCheckCircle className="w-5 h-5 md:w-6 md:h-6 mt-0.5 shrink-0 text-yellow-500" />
                          <span>{parking}</span>
                        </li>
                      )}
                    </ul>

                    <button className="w-full mt-6 font-noto-serif uppercase py-3 md:py-5 px-4 border border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors duration-300 rounded-lg text-sm md:text-base">
                      Más Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {totalPackages > itemsPerView && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${canPrev
                  ? "bg-yellow-800 text-white hover:bg-yellow-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              ← Anterior
            </button>
            <button
              onClick={goNext}
              disabled={!canNext}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${canNext
                  ? "bg-yellow-800 text-white hover:bg-yellow-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PartyPackageComponent;