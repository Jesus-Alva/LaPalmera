// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const API_URL = 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: displayName || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Error al registrar usuario');
      }

      setSuccess('Usuario registrado exitosamente. Redirigiendo...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Variants para animación escalonada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-10">
      {/* Tarjeta con glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xs bg-black/50 shadow-xl shadow-black/50 border border-white/20"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Título y subtítulo */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-4xl font-bold font-noto-serif text-gray-800 dark:text-white tracking-tight">
              Crear cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Únete a nuestra comunidad
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre (opcional) */}
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                placeholder="Tu nombre"
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                placeholder="tu@email.com"
              />
            </motion.div>

            {/* Contraseña */}
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo 8 caracteres</p>
            </motion.div>

            {/* Mensajes de error y éxito con animación */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                  className="text-red-600 dark:text-red-400 text-sm bg-red-100/50 dark:bg-red-900/30 backdrop-blur-sm p-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {success && (
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-green-600 dark:text-green-400 text-sm bg-green-100/50 dark:bg-green-900/30 backdrop-blur-sm p-3 rounded-xl"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Botón de registro */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-whitefont-noto-serif text-primary bg-secondary hover:bg-primary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Registrarse'
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Enlace a login */}
          <motion.div variants={itemVariants} className="text-center text-sm">
            <span className="text-white">¿Ya tienes cuenta? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}