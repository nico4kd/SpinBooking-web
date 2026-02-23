'use client';

import { useEffect, useState } from 'react';
import { X, Bike, User as InstructorIcon } from 'lucide-react';
import { Button, Card } from './ui';
import apiClient from '../lib/api-client';

interface BikeSelectionModalProps {
  classId: string;
  maxCapacity: number;
  onSelect: (bikeNumber: number | null) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface BikeData {
  classId: string;
  maxCapacity: number;
  occupiedBikes: number[];
  availableBikes: number[];
  totalOccupied: number;
  totalAvailable: number;
  popularBikes?: number[]; // Most requested bike numbers
}

export default function BikeSelectionModal({
  classId,
  maxCapacity,
  onSelect,
  onClose,
  isOpen,
}: BikeSelectionModalProps) {
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && classId) {
      loadBikeData();
    }
  }, [isOpen, classId]);

  const loadBikeData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<BikeData>(
        `/classes/${classId}/bikes`,
      );
      setBikeData(response.data);
    } catch (error) {
      console.error('Error loading bike data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBikeClick = (bikeNumber: number) => {
    if (bikeData?.occupiedBikes.includes(bikeNumber)) {
      return; // Can't select occupied bike
    }
    setSelectedBike(bikeNumber);
  };

  const handleConfirm = () => {
    onSelect(selectedBike);
    onClose();
  };

  const handleSkip = () => {
    onSelect(null); // No bike selected
    onClose();
  };

  if (!isOpen) return null;

  // Calculate rows (typically 3-4 rows in spinning studios)
  const bikesPerRow = Math.ceil(maxCapacity / 3);
  const rows = [];
  for (let i = 0; i < maxCapacity; i += bikesPerRow) {
    rows.push(Array.from({ length: bikesPerRow }, (_, j) => i + j + 1));
  }

  const getBikeStatus = (bikeNumber: number) => {
    if (bikeNumber > maxCapacity) return 'hidden';
    if (selectedBike === bikeNumber) return 'selected';
    if (bikeData?.occupiedBikes.includes(bikeNumber)) return 'occupied';
    return 'available';
  };

  const getBikeClassName = (status: string) => {
    const base =
      'relative w-16 h-16 rounded-[var(--radius-md)] border-2 flex flex-col items-center justify-center cursor-pointer transition-all';

    switch (status) {
      case 'selected':
        return `${base} bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary))] shadow-lg scale-110`;
      case 'occupied':
        return `${base} bg-[hsl(var(--surface-2))] border-[hsl(var(--border-default))] cursor-not-allowed opacity-50`;
      case 'available':
        return `${base} bg-[hsl(var(--success)/0.08)] border-[hsl(var(--success)/0.3)] hover:border-[hsl(var(--success))] hover:shadow-md hover:scale-105`;
      case 'hidden':
        return `${base} invisible`;
      default:
        return base;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card
        variant="elevated"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto m-4"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-headline">Selecciona tu Bicicleta</h2>
              <p className="text-sm text-secondary">
                Elige tu posición en el estudio
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Capacity Meter */}
          {bikeData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">Capacidad</span>
                <span className="font-medium">
                  <span className="text-[hsl(var(--success))]">{bikeData.totalAvailable}</span>
                  {' '}de{' '}
                  <span className="text-primary">{bikeData.maxCapacity}</span>
                  {' '}disponibles
                </span>
              </div>
              <div className="h-2 bg-[hsl(var(--surface-2))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--primary))] rounded-full transition-all duration-500"
                  style={{
                    width: `${((bikeData.maxCapacity - bikeData.totalAvailable) / bikeData.maxCapacity) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                <p className="text-secondary">Cargando bicicletas...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--success)/0.15)] border-2 border-[hsl(var(--success)/0.5)]" />
                  <span className="text-secondary">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--surface-2))] border-2 border-[hsl(var(--border-default))]" />
                  <span className="text-secondary">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--primary)/0.15)] border-2 border-[hsl(var(--primary))]" />
                  <span className="text-secondary">Seleccionada</span>
                </div>
              </div>

              {/* Instructor Position */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <InstructorIcon className="w-10 h-10 text-[hsl(var(--primary))]" />
                </div>
                <p className="text-xs text-secondary font-medium">
                  INSTRUCTOR
                </p>
              </div>

              {/* Bike Grid with Row Labels */}
              <div className="space-y-4">
                {rows.map((row, rowIndex) => {
                  const rowLabels = ['Front Row', 'Middle', 'Back Row'];
                  const rowLabel = rowLabels[rowIndex] || `Row ${rowIndex + 1}`;
                  const isFrontRow = rowIndex === 0;

                  return (
                    <div key={rowIndex} className="flex items-center gap-2 sm:gap-4">
                      {/* Row Label */}
                      <div className="w-16 sm:w-20 text-right flex-shrink-0">
                        <span className="text-label text-tertiary">
                          {rowLabel}
                        </span>
                        {isFrontRow && (
                          <div className="text-xs text-[hsl(var(--primary))] mt-1">
                            Cerca del instructor
                          </div>
                        )}
                      </div>

                      {/* Bikes */}
                      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
                        {row.map((bikeNumber) => {
                          const status = getBikeStatus(bikeNumber);
                          const isPopular = bikeData?.popularBikes?.includes(bikeNumber);

                          if (status === 'hidden') {
                            return <div key={bikeNumber} className="w-16 h-16" />;
                          }

                          return (
                            <div key={bikeNumber} className="relative group">
                              <button
                                onClick={() => handleBikeClick(bikeNumber)}
                                disabled={status === 'occupied'}
                                className={getBikeClassName(status)}
                                title={
                                  status === 'occupied'
                                    ? 'Bicicleta ocupada'
                                    : `Bicicleta #${bikeNumber}${isPopular ? ' • Popular' : ''}`
                                }
                              >
                                <Bike
                                  className={`w-6 h-6 mb-1 ${
                                    status === 'selected'
                                      ? 'text-[hsl(var(--primary))]'
                                      : status === 'occupied'
                                        ? 'text-tertiary'
                                        : 'text-[hsl(var(--success))]'
                                  }`}
                                />
                                <span
                                  className={`text-xs font-bold ${
                                    status === 'selected'
                                      ? 'text-[hsl(var(--primary))]'
                                      : status === 'occupied'
                                        ? 'text-tertiary'
                                        : 'text-secondary'
                                  }`}
                                >
                                  {bikeNumber}
                                </span>

                                {/* Popularity Badge */}
                                {isPopular && status === 'available' && (
                                  <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[hsl(var(--accent-hot))] text-white text-[10px] font-bold">
                                    ★
                                  </div>
                                )}
                              </button>

                              {/* Hover Tooltip */}
                              {status === 'available' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  <div className="font-medium text-primary mb-1">
                                    Bicicleta #{bikeNumber}
                                  </div>
                                  <div className="text-secondary space-y-0.5">
                                    <div>{rowLabel}</div>
                                    {isPopular && (
                                      <div className="text-[hsl(var(--accent-hot))]">
                                        ★ Más solicitada
                                      </div>
                                    )}
                                    {isFrontRow && (
                                      <div className="text-[hsl(var(--primary))]">
                                        Vista frontal
                                      </div>
                                    )}
                                  </div>
                                  {/* Arrow */}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                    <div className="border-4 border-transparent border-t-[hsl(var(--surface-2))]" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Spacer for alignment */}
                      <div className="w-20 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* Selected Bike Info */}
              {selectedBike && (
                <div className="text-center p-4 bg-[hsl(var(--primary)/0.08)] rounded-[var(--radius-lg)] border border-[hsl(var(--primary)/0.3)]">
                  <p className="text-sm">
                    <span className="text-secondary">Bicicleta seleccionada: </span>
                    <span className="font-bold text-[hsl(var(--primary))]">
                      #{selectedBike}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[hsl(var(--surface-0))] border-t border-[hsl(var(--border-default))] p-6 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
            disabled={loading}
          >
            Asignar Automáticamente
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="flex-1"
            disabled={loading || !selectedBike}
          >
            Confirmar Reserva
          </Button>
        </div>
      </Card>
    </div>
  );
}
