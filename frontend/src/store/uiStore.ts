import { create } from 'zustand';

export interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}


interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  isNotificationsOpen: boolean;
  isUserMenuOpen: boolean;
  notifications: Notification[];
  toggleTheme: (e?: any) => void;
  toggleSidebar: () => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuthModalView: (view: 'login' | 'register') => void;
  setNotificationsOpen: (isOpen: boolean) => void;
  setUserMenuOpen: (isOpen: boolean) => void;
  markAllNotificationsAsRead: () => void;
}

export const useUIStore = create<UIState>((set) => {
  const getInitialTheme = (): 'light' | 'dark' => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  return {
    theme: getInitialTheme(),
    sidebarOpen: true,
    isAuthModalOpen: false,
    authModalView: 'login',
    isNotificationsOpen: false,
    isUserMenuOpen: false,
    notifications: [],
    toggleTheme: (e?: any) => {
    const doToggle = () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doToggle();
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    // Always calculate from the exact center of the visible switch button
    if (e && e.target) {
      // Find the associated label since the input itself is display: none
      const targetId = e.target.id;
      const label = document.querySelector(`label[for="${targetId}"]`);
      if (label) {
        const rect = label.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (e.clientX !== undefined) {
        // Fallback to mouse position
        x = e.clientX;
        y = e.clientY;
      }
    }

    const transition = document.startViewTransition(() => {
      doToggle();
    });

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    setAuthModalView: (view) => set({ authModalView: view }),
    setNotificationsOpen: (isOpen) => set({ isNotificationsOpen: isOpen }),
    setUserMenuOpen: (isOpen) => set({ isUserMenuOpen: isOpen }),
    markAllNotificationsAsRead: () => set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),
    };
  });
