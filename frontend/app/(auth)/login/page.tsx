// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/lib/api/auth';
import { decodeJwtPayload } from '@/lib/jwt';

const Page: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      const role = decodeJwtPayload<{ role?: string }>(data.access_token)?.role;

      // Un rol de solo lectura (todo usuario recién registrado) no debe entrar
      // al panel de administración, solo al sitio público. Se usa una navegación
      // completa (no router.push) para forzar la recarga de toda la página: el
      // layout raíz calcula el usuario logueado en el servidor y, con una
      // navegación del lado del cliente, Next.js puede servir la versión en
      // caché de la ruta (sin sesión) en vez de recalcularla con la cookie nueva.
      window.location.href = role === 'read' ? '/' : '/banners';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Variants para animación escalonada de los hijos
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

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:p-4 mt-10">
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
            <h2 className="text-4xl font-noto-serif font-bold text-gray-800 dark:text-white tracking-tight">
              Bienvenido
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Inicia sesión para continuar
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo email */}
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
                className="mt-1 block w-full px-4 py-3 bg-white/50  backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                placeholder="tu@email.com"
              />
              {/* Línea animada al focus (se puede hacer con pseudo-elementos en CSS, pero aquí no es necesario) */}
            </motion.div>

            {/* Campo contraseña */}
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-11 bg-white/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            {/* Mensaje de error con animación de shake */}
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

            {/* Botón de envío */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium font-noto-serif text-primary bg-secondary hover:bg-primary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Entrar'
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Enlace a registro (opcional) */}
          <motion.div variants={itemVariants} className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">¿No tienes cuenta? </span>
            <a href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page;