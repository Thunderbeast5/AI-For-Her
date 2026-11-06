import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom'
import { BellIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import GoogleTranslate from './GoogleTranslate'
import { SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import { ScrollArea } from './ui/scroll-area'

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation()

  
  // Fetch notifications from Firestore in real-time
  useEffect(() => {
    if (!currentUser?.uid) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const unread = notificationsList.filter(n => !n.read).length;

      setNotifications(notificationsList.slice(0, 10));
      setUnreadCount(unread);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const pageTitles = {
    '/dashboard': 'Overview',
    '/mentor/dashboard': 'Overview',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/analytics': 'Analytics',
    '/mentor/requests': 'Connection Requests',
    '/mentees': 'My Mentees',
    '/mentor/create-group': 'Create a Group',
    '/mentor/my-groups': 'My Groups',
    '/group-sessions': 'Group Mentoring',
    '/schedule': 'Schedule',
    '/chat-sessions': 'Chat Sessions',
    '/browse-projects': 'Browse Projects',
    '/portfolio': 'Portfolio',
    '/saved': 'Saved Projects',
    '/investments': 'Investments',
    '/create-startup': 'Create Startup',
    '/list-project': 'List for Investment',
    '/enterprise/products': 'Manage Products',
    '/mentors': 'Find Mentors',
    '/shg': 'Self Help Groups',
    '/opportunities': 'Opportunities',
    '/chat': 'AI Coach',
    '/journey': 'Growth Journey',
  }

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-inner">
        <div className="dashboard-topbar-heading">
          <SidebarTrigger className="dashboard-sidebar-trigger" />
          <h1 className="dashboard-topbar-title">{pageTitles[location.pathname] || 'Dashboard'}</h1>
        </div>
        
        <div className="dashboard-topbar-actions">
          {/* Google Translate Widget - Now Visible */}
          <GoogleTranslate />

          {/* Notifications */}
          <div className="dashboard-notification-wrap">
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="dashboard-icon-button"
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="dashboard-notification-count">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>

              {/* Notifications Dropdown */}
              <PopoverContent className="dashboard-popover dashboard-notification-popover" align="end" sideOffset={8}>
                <div className="dashboard-popover-heading">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <span>{unreadCount} new</span>}
                </div>
                <ScrollArea className="dashboard-notification-list">
                  {notifications.length === 0 ? (
                    <div className="dashboard-empty-notifications">
                      <BellIcon className="w-8 h-8" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id);

                          if (notification.type === 'mentor-connection-accepted' && notification.connectionId) {
                            navigate(`/mentors?connectionId=${notification.connectionId}&openPayment=1`);
                          } else if (notification.link) {
                            navigate(notification.link);
                          }

                          setNotificationsOpen(false);
                        }}
                        className={`dashboard-notification ${
                          !notification.read ? 'is-unread' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="dashboard-notification-title">{notification.title}</p>
                            <p className="dashboard-notification-message">{notification.message}</p>
                            <p className="dashboard-notification-time">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 mt-1">
                            {!notification.read && (
                              <div className="dashboard-unread-dot"></div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="dashboard-delete-notification"
                              aria-label="Delete notification"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Navbar
