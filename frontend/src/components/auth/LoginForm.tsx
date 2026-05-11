import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  isModal?: boolean;
}

const LoginForm = ({ isModal = false }: LoginFormProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { setAuthModalOpen, setAuthModalView } = useUIStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, refreshToken, ...user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      if (isModal) {
        setAuthModalOpen(false);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const content = (
    <motion.div 
      initial={{ opacity: 0, y: isModal ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`max-w-md w-full space-y-8 ${isModal ? '' : 'glass-panel p-8 rounded-2xl'}`}
    >
      <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-dark-text"
          >
            Welcome back
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-sm text-gray-600 dark:text-dark-muted"
          >
            Or {isModal ? (
              <button type="button" onClick={() => setAuthModalView('register')} className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </button>
            ) : (
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">create a new account</Link>
            )}
          </motion.p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-md shadow-sm space-y-4"
          >
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg transition-colors duration-200">
      {content}
    </div>
  );
};

export default LoginForm;
