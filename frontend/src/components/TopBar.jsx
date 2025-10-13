// src/components/TopBar.jsx
import { useState } from 'react';
import bellIcon from '../assets/bell.svg';
import userAvatar from '../assets/user.svg';
import creditsIcon from '../assets/credits.svg';

function TopBar({ notifications, markNotificationAsRead, user, credits, setAuth, setUser }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications?.filter((notif) => !notif.read)?.length || 0;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);

    if (notificationsOpen === false && unreadCount > 0) {
      notifications.forEach((notif) => {
        if (!notif.read) {
          markNotificationAsRead(notif.id);
        }
      });
    }
  };

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    setUser(null);
    window.location.href = '/signin';
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-800 p-4 bg-gray-900">
      <div className="text-xl font-bold text-white">AI Chat</div>
      
      <div className="flex items-center gap-6">
        {/* Credits Display */}
        <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
          credits <= 0 ? 'bg-red-900/30 text-red-400 border border-red-500' :
          credits <= 10 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500' :
          'bg-blue-900/30 text-blue-400 border border-blue-500'
        }`}>
          <img src={creditsIcon} alt="Credits" className="h-5 w-5 mr-2" />
          <span className="font-bold">{credits}</span>
          <span className="ml-1 text-xs">credits</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="Notifications" className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Notifications</h3>
                <span className="text-gray-400 text-sm">({unreadCount})</span>
              </div>

              <div className="py-2">
                {notifications?.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed">
                            {notification.content}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {notification.time || new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <span className="text-white text-sm font-medium">{user?.username || 'Guest'}</span>
            <img src={userAvatar} alt="User" className="h-8 w-8 rounded-full cursor-pointer" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-gray-700">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;