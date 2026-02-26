'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../../lib/api-client';
import { bikesApi } from '../../../../lib/api/bikes';
import type { BikeRecord } from '../../../../lib/api/bikes';
import { Card, Button } from '../../../../components/ui';
import { AdminLayout, AdminPageHeader } from '../../../../components/admin';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  Bike,
  CheckCircle,
  XCircle,
  Building2,
} from 'lucide-react';
import { toast } from '../../../../lib/toast';
import Link from 'next/link';

const BIKE_SIZES = ['S', 'M', 'L', 'XL'] as const;
type BikeSize = (typeof BIKE_SIZES)[number];
type BikeStatus = 'ACTIVE' | 'INACTIVE';

interface RoomData {
  id: string;
  name: string;
  location: string | null;
  capacity: number;
  status: string;
}

interface BikeEditState {
  id: string;
  number: number;
  size: BikeSize;
  status: BikeStatus;
  originalSize: BikeSize;
  originalStatus: BikeStatus;
}

export default function AdminBikesPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');

  // Data state
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomIdParam || '');
  const [bikes, setBikes] = useState<BikeEditState[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingBike, setSavingBike] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadRooms();
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (selectedRoomId) {
      loadBikes(selectedRoomId);
    } else {
      setBikes([]);
    }
  }, [selectedRoomId]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await api.get('/rooms');
      let roomsData: RoomData[] = [];
      if (Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      }
      setRooms(roomsData);

      // Auto-select if roomId was in URL params or only one room exists
      if (roomIdParam && roomsData.some((r) => r.id === roomIdParam)) {
        setSelectedRoomId(roomIdParam);
      } else if (roomsData.length === 1) {
        setSelectedRoomId(roomsData[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar salas');
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadBikes = async (roomId: string) => {
    setLoadingBikes(true);
    setError(null);
    try {
      const data = await bikesApi.getByRoom(roomId);
      const editStates: BikeEditState[] = data.map((bike: BikeRecord) => ({
        id: bike.id,
        number: bike.number,
        size: bike.size as BikeSize,
        status: bike.status as BikeStatus,
        originalSize: bike.size as BikeSize,
        originalStatus: bike.status as BikeStatus,
      }));
      setBikes(editStates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar bicicletas');
    } finally {
      setLoadingBikes(false);
    }
  };

  const handleSizeChange = (bikeId: string, newSize: BikeSize) => {
    setBikes((prev) =>
      prev.map((b) => (b.id === bikeId ? { ...b, size: newSize } : b)),
    );
  };

  const handleStatusToggle = async (bikeId: string) => {
    const bike = bikes.find((b) => b.id === bikeId);
    if (!bike) return;

    const newStatus: BikeStatus = bike.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setSavingBike(bikeId);
    try {
      await bikesApi.update(bikeId, { status: newStatus });
      setBikes((prev) =>
        prev.map((b) =>
          b.id === bikeId
            ? { ...b, status: newStatus, originalStatus: newStatus }
            : b,
        ),
      );
      toast.success(
        newStatus === 'ACTIVE'
          ? `Bici #${bike.number} activada`
          : `Bici #${bike.number} desactivada`,
      );
    } catch (err: any) {
      toast.error('Error al cambiar estado', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSavingBike(null);
    }
  };

  const handleSaveSingleSize = async (bikeId: string) => {
    const bike = bikes.find((b) => b.id === bikeId);
    if (!bike || bike.size === bike.originalSize) return;

    setSavingBike(bikeId);
    try {
      await bikesApi.update(bikeId, { size: bike.size });
      setBikes((prev) =>
        prev.map((b) =>
          b.id === bikeId ? { ...b, originalSize: bike.size } : b,
        ),
      );
      toast.success(`Bici #${bike.number} actualizada a talle ${bike.size}`);
    } catch (err: any) {
      // Revert on failure
      setBikes((prev) =>
        prev.map((b) =>
          b.id === bikeId ? { ...b, size: bike.originalSize } : b,
        ),
      );
      toast.error('Error al guardar', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSavingBike(null);
    }
  };

  const dirtyBikes = bikes.filter((b) => b.size !== b.originalSize);
  const hasDirtyBikes = dirtyBikes.length > 0;

  const handleBulkSave = async () => {
    if (!hasDirtyBikes || !selectedRoomId) return;

    setBulkSaving(true);
    try {
      await bikesApi.bulkUpdate(selectedRoomId, {
        updates: dirtyBikes.map((b) => ({ bikeId: b.id, size: b.size })),
      });
      setBikes((prev) =>
        prev.map((b) => ({
          ...b,
          originalSize: b.size,
        })),
      );
      toast.success(`${dirtyBikes.length} bicicleta(s) actualizada(s)`);
    } catch (err: any) {
      // Revert all dirty bikes on failure
      setBikes((prev) =>
        prev.map((b) => ({
          ...b,
          size: b.originalSize,
        })),
      );
      toast.error('Error al guardar cambios', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setBulkSaving(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const sizeDistribution = bikes.reduce(
    (acc, b) => {
      acc[b.size] = (acc[b.size] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const activeBikes = bikes.filter((b) => b.status === 'ACTIVE').length;
  const inactiveBikes = bikes.filter((b) => b.status === 'INACTIVE').length;

  if (loading || (isAuthenticated && user?.role !== 'ADMIN')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="pl-16 pr-4 pt-4 pb-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/admin/rooms"
              className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Salas
            </Link>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                Gestionar Bicicletas
              </h1>
              <p className="mt-2 text-gray-600 truncate">
                Configura el talle y estado de cada bicicleta por sala
              </p>
            </div>
            {hasDirtyBikes && (
              <Button
                onClick={handleBulkSave}
                disabled={bulkSaving}
                className="flex items-center space-x-2 flex-shrink-0"
              >
                {bulkSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Guardar todos ({dirtyBikes.length})</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Room Selector */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar sala
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={loadingRooms}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">-- Elegir sala --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.capacity} bicis)
                    {room.location ? ` - ${room.location}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingBikes && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando bicicletas...</p>
            </div>
          </div>
        )}

        {/* No room selected */}
        {!selectedRoomId && !loadingRooms && (
          <div className="text-center py-12">
            <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Selecciona una sala</p>
            <p className="text-gray-500 mt-2">
              Elige una sala del selector de arriba para gestionar sus bicicletas
            </p>
          </div>
        )}

        {/* Bikes Table */}
        {selectedRoomId && !loadingBikes && !error && bikes.length > 0 && (
          <>
            {/* Summary Bar */}
            <Card className="mb-6 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold">{bikes.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Activas</p>
                    <p className="text-lg font-bold text-green-600">{activeBikes}</p>
                  </div>
                  {inactiveBikes > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Inactivas</p>
                      <p className="text-lg font-bold text-gray-400">{inactiveBikes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {BIKE_SIZES.map((size) => (
                    <div key={size} className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{size}</p>
                      <p className="text-sm font-semibold">{sizeDistribution[size] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bikes Grid */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bikes.map((bike) => {
                    const isDirty = bike.size !== bike.originalSize;
                    const isSaving = savingBike === bike.id;
                    const isInactive = bike.status === 'INACTIVE';

                    return (
                      <tr
                        key={bike.id}
                        className={`${isInactive ? 'bg-gray-50 opacity-70' : ''} ${isDirty ? 'bg-amber-50/50' : ''} hover:bg-gray-50 transition-colors`}
                      >
                        {/* Number */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                isInactive
                                  ? 'bg-gray-200 text-gray-400'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {bike.number}
                            </div>
                          </div>
                        </td>

                        {/* Size Dropdown */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={bike.size}
                            onChange={(e) => handleSizeChange(bike.id, e.target.value as BikeSize)}
                            disabled={isSaving || bulkSaving}
                            className={`px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                              isDirty
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-gray-300'
                            }`}
                          >
                            {BIKE_SIZES.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                          {isDirty && (
                            <span className="ml-2 text-xs text-amber-600">
                              (sin guardar)
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusToggle(bike.id)}
                            disabled={isSaving || bulkSaving}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              bike.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : bike.status === 'ACTIVE' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {bike.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {isDirty && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveSingleSize(bike.id)}
                              disabled={isSaving || bulkSaving}
                            >
                              {isSaving ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Guardar
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk Save Footer */}
            {hasDirtyBikes && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <p className="text-sm text-amber-800">
                  {dirtyBikes.length} bicicleta(s) con cambios sin guardar
                </p>
                <Button
                  onClick={handleBulkSave}
                  disabled={bulkSaving}
                  size="sm"
                >
                  {bulkSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Guardar todos
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State (room selected but no bikes) */}
        {selectedRoomId && !loadingBikes && !error && bikes.length === 0 && (
          <div className="text-center py-12">
            <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay bicicletas</p>
            <p className="text-gray-500 mt-2">
              Esta sala no tiene bicicletas configuradas. Las bicicletas se crean automaticamente al crear la sala.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
