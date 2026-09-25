'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await login(data.username, data.password);
      router.push('/panel');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SITBT</h1>
            <p className="text-gray-600 mt-1">Instituto Tecnológico Boliviana de Tecnología</p>
          </div>

          <Card variant="elevated">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingrese sus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    label="Usuario"
                    placeholder="Ingrese su usuario"
                    error={errors.username?.message}
                    {...register('username')}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} SITBT - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
