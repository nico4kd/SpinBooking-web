'use client';

import { useEffect, useState } from 'react';
import { X, Bike, User as InstructorIcon, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { Button, Card } from './ui';
import { classesApi, systemConfigApi } from '../lib/api';
import type { BikeData, BikeInfo } from '../lib/api/classes';

type SelectionMode = 'bike' | 'size';
type ModalStep = 'selection' | 'confirmation';

export interface BikeSelection {
  bikeNumber?: number;
  bikeSize?: string;
}

interface BikeSelectionModalProps {
  classId: string;
  maxCapacity: number;
  onSelect: (selection: BikeSelection) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
  classTime?: string;
}

export default function BikeSelectionModal({
  classId,
  maxCapacity,
  onSelect,
  onClose,
  isOpen,
  className: classTitle,
  classTime,
}: BikeSelectionModalProps) {
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('bike');
  const [step, setStep] = useState<ModalStep>('selection');
  const [loading, setLoading] = useState(true);
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && classId) {
      loadBikeData();
      loadCancellationDeadline();
      // Reset state on open
      setSelectedBike(null);
      setSelectedSize(null);
      setSelectionMode('bike');
      setStep('selection');
    }
  }, [isOpen, classId]);

  const loadBikeData = async () => {
    setLoading(true);
    try {
      const data = await classesApi.getBikeData(classId);
      setBikeData(data);
    } catch (error) {
      console.error('Error loading bike data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCancellationDeadline = async () => {
    try {
      const data = await systemConfigApi.getCancellationDeadline();
      setCancellationDeadlineHours(data.hours);
    } catch (error) {
      console.error('Error loading cancellation deadline:', error);
      setCancellationDeadlineHours(null);
    }
  };

  // Build a lookup map from bike number to bike info
  const bikeInfoMap = new Map<number, BikeInfo>();
  if (bikeData?.bikes) {
    for (const bike of bikeData.bikes) {
      bikeInfoMap.set(bike.number, bike);
    }
  }

  const getBikeSize = (bikeNumber: number): string | null => {
    return bikeInfoMap.get(bikeNumber)?.size ?? null;
  };

  const isBikeInactive = (bikeNumber: number): boolean => {
    const info = bikeInfoMap.get(bikeNumber);
    return info?.status === 'INACTIVE';
  };

  const handleBikeClick = (bikeNumber: number) => {
    if (bikeData?.occupiedBikes.includes(bikeNumber)) return;
    if (isBikeInactive(bikeNumber)) return;
    setSelectedBike(bikeNumber);
  };

  const handleSizeClick = (size: string) => {
    const availability = bikeData?.sizeAvailability?.find((s) => s.size === size);
    if (!availability || availability.available === 0) return;
    setSelectedSize(size);
  };

  const handleProceedToConfirmation = () => {
    setStep('confirmation');
  };

  const handleBackToSelection = () => {
    setStep('selection');
  };

  const handleConfirm = () => {
    if (selectionMode === 'bike' && selectedBike) {
      onSelect({ bikeNumber: selectedBike });
    } else if (selectionMode === 'size' && selectedSize) {
      onSelect({ bikeSize: selectedSize });
    }
    onClose();
  };

  const handleSkip = () => {
    onSelect({}); // No bike or size selected — auto-assign
    onClose();
  };

  const handleModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    // Clear selection from the other mode
    if (mode === 'bike') {
      setSelectedSize(null);
    } else {
      setSelectedBike(null);
    }
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
    if (isBikeInactive(bikeNumber)) return 'occupied';
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

  const hasSelection =
    (selectionMode === 'bike' && selectedBike !== null) ||
    (selectionMode === 'size' && selectedSize !== null);

  // Get selected bike size label for confirmation
  const getSelectedBikeSizeLabel = (): string | null => {
    if (selectedBike && bikeData?.bikes) {
      return getBikeSize(selectedBike);
    }
    return null;
  };

  // Format cancellation deadline text
  const getCancellationText = (): string => {
    if (cancellationDeadlineHours !== null) {
      return `Podrás cancelar hasta ${cancellationDeadlineHours} hora(s) antes de la clase para recuperar tu crédito.`;
    }
    return 'Revisá la política de cancelación.';
  };

  // Size labels for display
  const SIZE_LABELS: Record<string, string> = {
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card
        variant="elevated"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto m-4"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-headline">
                {step === 'confirmation' ? 'Confirmar Reserva' : 'Seleccioná tu Bicicleta'}
              </h2>
              <p className="text-sm text-secondary">
                {step === 'confirmation'
                  ? 'Revisá los detalles antes de confirmar'
                  : 'Elegí tu posición en el estudio'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Capacity Meter - only on selection step */}
          {step === 'selection' && bikeData && (
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
          ) : step === 'confirmation' ? (
            /* ─── Confirmation Step ─── */
            <div className="space-y-6">
              {/* Selection Summary */}
              <div className="text-center p-6 bg-[hsl(var(--primary)/0.08)] rounded-[var(--radius-lg)] border border-[hsl(var(--primary)/0.3)]">
                <Bike className="w-10 h-10 text-[hsl(var(--primary))] mx-auto mb-3" />
                {selectionMode === 'bike' && selectedBike ? (
                  <div>
                    <p className="text-lg font-bold text-[hsl(var(--primary))]">
                      Bicicleta #{selectedBike}{getSelectedBikeSizeLabel() ? ` - ${getSelectedBikeSizeLabel()}` : ''}
                    </p>
                  </div>
                ) : selectionMode === 'size' && selectedSize ? (
                  <div>
                    <p className="text-lg font-bold text-[hsl(var(--primary))]">
                      Talle {selectedSize}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      Se asignará una bicicleta disponible
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Class Info */}
              {(classTitle || classTime) && (
                <div className="p-4 bg-[hsl(var(--surface-1))] rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))]">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                    <span className="text-secondary">Clase:</span>
                    <span className="font-medium">
                      {classTitle}{classTime ? ` - ${classTime}` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="p-4 bg-[hsl(var(--surface-1))] rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Política de cancelación</p>
                    <p className="text-sm text-secondary">
                      {getCancellationText()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── Selection Step ─── */
            <>
              {/* Mode Toggle */}
              {bikeData?.sizeAvailability && bikeData.sizeAvailability.length > 0 && (
                <div className="flex items-center justify-center">
                  <div className="inline-flex rounded-[var(--radius-lg)] bg-[hsl(var(--surface-2))] p-1">
                    <button
                      onClick={() => handleModeChange('bike')}
                      className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${
                        selectionMode === 'bike'
                          ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      Elegir bicicleta
                    </button>
                    <button
                      onClick={() => handleModeChange('size')}
                      className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${
                        selectionMode === 'size'
                          ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      Elegir por talle
                    </button>
                  </div>
                </div>
              )}

              {selectionMode === 'bike' ? (
                /* ─── Bike Grid Mode ─── */
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
                              const bikeSize = getBikeSize(bikeNumber);

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
                                        : `Bicicleta #${bikeNumber}${bikeSize ? ` - ${bikeSize}` : ''}${isPopular ? ' - Popular' : ''}`
                                    }
                                  >
                                    <Bike
                                      className={`w-5 h-5 ${
                                        status === 'selected'
                                          ? 'text-[hsl(var(--primary))]'
                                          : status === 'occupied'
                                            ? 'text-tertiary'
                                            : 'text-[hsl(var(--success))]'
                                      }`}
                                    />
                                    <span
                                      className={`text-[10px] font-bold leading-tight ${
                                        status === 'selected'
                                          ? 'text-[hsl(var(--primary))]'
                                          : status === 'occupied'
                                            ? 'text-tertiary'
                                            : 'text-secondary'
                                      }`}
                                    >
                                      #{bikeNumber}{bikeSize ? ` - ${bikeSize}` : ''}
                                    </span>

                                    {/* Popularity Badge */}
                                    {isPopular && status === 'available' && (
                                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[hsl(var(--accent-hot))] text-white text-[10px] font-bold">
                                        *
                                      </div>
                                    )}
                                  </button>

                                  {/* Hover Tooltip */}
                                  {status === 'available' && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      <div className="font-medium text-primary mb-1">
                                        Bicicleta #{bikeNumber}{bikeSize ? ` - ${bikeSize}` : ''}
                                      </div>
                                      <div className="text-secondary space-y-0.5">
                                        <div>{rowLabel}</div>
                                        {bikeSize && (
                                          <div>Talle: {bikeSize}</div>
                                        )}
                                        {isPopular && (
                                          <div className="text-[hsl(var(--accent-hot))]">
                                            * Mas solicitada
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
                          #{selectedBike}{getSelectedBikeSizeLabel() ? ` - ${getSelectedBikeSizeLabel()}` : ''}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* ─── Size Selection Mode ─── */
                <div className="space-y-4">
                  <p className="text-sm text-secondary text-center">
                    Elegí un talle y te asignaremos una bicicleta disponible.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(bikeData?.sizeAvailability ?? []).map((sizeInfo) => {
                      const isDisabled = sizeInfo.available === 0;
                      const isSelected = selectedSize === sizeInfo.size;

                      return (
                        <button
                          key={sizeInfo.size}
                          onClick={() => handleSizeClick(sizeInfo.size)}
                          disabled={isDisabled}
                          className={`relative p-6 rounded-[var(--radius-lg)] border-2 text-center transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary))] shadow-lg scale-105'
                              : isDisabled
                                ? 'bg-[hsl(var(--surface-2))] border-[hsl(var(--border-default))] cursor-not-allowed opacity-50'
                                : 'bg-[hsl(var(--success)/0.08)] border-[hsl(var(--success)/0.3)] hover:border-[hsl(var(--success))] hover:shadow-md hover:scale-105 cursor-pointer'
                          }`}
                        >
                          <div className={`text-2xl font-bold mb-1 ${
                            isSelected
                              ? 'text-[hsl(var(--primary))]'
                              : isDisabled
                                ? 'text-tertiary'
                                : 'text-primary'
                          }`}>
                            {sizeInfo.size}
                          </div>
                          <div className={`text-xs ${
                            isSelected
                              ? 'text-[hsl(var(--primary))]'
                              : 'text-secondary'
                          }`}>
                            {SIZE_LABELS[sizeInfo.size] || sizeInfo.size}
                          </div>
                          <div className={`text-sm font-medium mt-2 ${
                            isSelected
                              ? 'text-[hsl(var(--primary))]'
                              : isDisabled
                                ? 'text-tertiary'
                                : 'text-[hsl(var(--success))]'
                          }`}>
                            {isDisabled ? (
                              'No disponible'
                            ) : (
                              `${sizeInfo.available} disponible${sizeInfo.available !== 1 ? 's' : ''}`
                            )}
                          </div>
                          <div className="text-xs text-tertiary mt-1">
                            {sizeInfo.total} total
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Size Info */}
                  {selectedSize && (
                    <div className="text-center p-4 bg-[hsl(var(--primary)/0.08)] rounded-[var(--radius-lg)] border border-[hsl(var(--primary)/0.3)]">
                      <p className="text-sm">
                        <span className="text-secondary">Talle seleccionado: </span>
                        <span className="font-bold text-[hsl(var(--primary))]">
                          {selectedSize}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[hsl(var(--surface-0))] border-t border-[hsl(var(--border-default))] p-6 flex items-center gap-3">
          {step === 'confirmation' ? (
            <>
              <Button
                variant="outline"
                onClick={handleBackToSelection}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Reserva
              </Button>
            </>
          ) : (
            <>
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
                onClick={handleProceedToConfirmation}
                className="flex-1"
                disabled={loading || !hasSelection}
              >
                Continuar
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
