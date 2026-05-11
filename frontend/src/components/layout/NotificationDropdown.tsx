import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { Bell, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';

const NotificationDropdown = () => {
  const { notifications, markAllNotificationsAsRead, setNotificationsOpen } = useUIStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden z-50 transition-all duration-200 origin-top-right">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50 dark:bg-dark-bg/50">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
        <button 
          onClick={markAllNotificationsAsRead}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors cursor-pointer relative ${!notification.read ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}
              >
                {!notification.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500" />
                )}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-200 dark:text-dark-border mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-200 dark:border-dark-border text-center bg-gray-50 dark:bg-dark-bg/50">
        <button className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
