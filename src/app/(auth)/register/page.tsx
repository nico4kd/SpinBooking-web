'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import Link from 'next/link';
import { Button, Input, Card } from '../../../components/ui';
import { UserPlus, Zap } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--accent-hot)/0.06)] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            <Zap className="w-6 h-6 text-[hsl(var(--primary))]" />
            SpinBooking
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Crea tu cuenta</h2>
            <p className="mt-2 text-sm text-secondary">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Register Card */}
        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.15)] border border-[hsl(var(--destructive)/0.3)] p-4">
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
              />

              <Input
                label="Apellido"
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="juan@example.com"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="Teléfono"
              id="phone"
              name="phone"
              type="tel"
              placeholder="+54 11 1234-5678"
              helperText="Opcional"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Mínimo 8 caracteres"
              helperText="Debe contener mayúscula, minúscula y número"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="hot"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Crear Cuenta
                </span>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-tertiary">
          Al crear una cuenta aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}
