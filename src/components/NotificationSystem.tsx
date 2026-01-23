import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, Check } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Notification {
  _id: string;
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  priority: string;
  from: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: {
    requestId?: string;
    assetIds?: string[];
    departmentId?: string;
    priority?: string;
  };
}

interface NotificationSystemProps {
  userName?: string;
  userDepartment?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userName, userDepartment }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Get user preference from localStorage
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) {
      console.log('🔔 Notification sound disabled by user');
      return;
    }

    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple notification sound using Web Audio API
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set sound properties (pleasant notification tone)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Start frequency
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1); // End frequency
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2); // Final frequency
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Start volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Fade out
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔔 Played notification sound');
    } catch (error) {
      console.error('🔔 Error playing notification sound:', error);
    }
  };

  // Toggle sound preference
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(newSoundEnabled));
    
    // Play test sound when enabling
    if (newSoundEnabled) {
      playNotificationSound();
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔔 Initializing Socket.IO with token:', !!token);
    
    if (!token) {
      console.error('🔔 No token found - cannot connect socket');
      return;
    }

    const newSocket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to notification server');
      setIsConnected(true);
      newSocket.emit('authenticate', token);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
      if (userDepartment) {
        console.log('🔔 Joining department room:', userDepartment);
        newSocket.emit('join_department', userDepartment);
      }
    });

    newSocket.on('authentication_error', (error) => {
      console.error('❌ Socket auth failed:', error);
      setIsConnected(false);
    });

    newSocket.on('new_notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      
      // Play notification sound
      playNotificationSound();
      
      // Add new notification to state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show popup notification
      showNotificationPopup(notification);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from notification server:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.close();
    };
  }, [userDepartment]);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/unread-count', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/read-all', {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Show popup notification
  const showNotificationPopup = (notification: Notification) => {
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.innerHTML = `
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
        <small>${new Date(notification.timestamp).toLocaleString()}</small>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 5000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isConnected ? 'Connected' : 'Disconnected'} />
        
        {/* Test Button for Debugging */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('🧪 Testing notification popup manually...');
            
            // Play test sound
            playNotificationSound();
            
            const testNotification: Notification = {
              _id: 'test_' + Date.now(),
              id: 'test_' + Date.now(),
              type: 'test',
              title: 'Test Notification',
              message: 'This is a test notification to verify the system is working',
              read: false,
              timestamp: new Date().toISOString(),
              priority: 'info',
              from: {
                id: 'system',
                name: 'Test System',
                role: 'system'
              }
            };
            
            setNotifications(prev => [testNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            showNotificationPopup(testNotification);
          }}
          className="text-xs"
        >
          Test
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Notifications {isConnected && '🟢'}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Sound Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="text-xs"
                  title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </Button>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 h-6"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export { NotificationSystem };
