import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, getCountFromServer, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import FriendsList from '../components/FriendsList';

interface ProfileStats {
  totalEchoes: number;
  totalFriends: number;
  privateVibes: number;
  mostUsedMood: string;
}

const Profile: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser, echoId, rotateEchoId } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    totalEchoes: 0,
    totalFriends: 0,
    privateVibes: 0,
    mostUsedMood: '😊',
  });

  const [rotateId, setRotateId] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        // Fetch total echoes count for current user
        const echoesQuery = query(
          collection(db, 'echoes'),
          where('userId', '==', currentUser.uid)
        );
        const echoSnapshot = await getCountFromServer(echoesQuery);
        
        // Fetch friends count from the friends array in the user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        let friendsCount = 0;
        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            if (userData.friends && Array.isArray(userData.friends)) {
                friendsCount = userData.friends.length;
            }
        }

        // Fetch private vibes count for current user
        const privateVibesQuery = query(
          collection(db, 'privateVibes'),
          where('userId', '==', currentUser.uid),
          where('isShared', '==', false)
        );
        const privateVibesSnapshot = await getCountFromServer(privateVibesQuery);
        
        // Fetch most used mood for current user
        const userEchoesQuery = query(
          collection(db, 'echoes'),
          where('userId', '==', currentUser.uid)
        );
        const echoesSnapshot = await getDocs(userEchoesQuery);
        const moodCounts: { [key: string]: number } = {};
        
        echoesSnapshot.forEach((doc) => {
          const data = doc.data();
          const mood = data.mood;
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        const mostUsedMood = Object.entries(moodCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || '😊';
        
        setStats({
          totalEchoes: echoSnapshot.data().count,
          totalFriends: friendsCount,
          privateVibes: privateVibesSnapshot.data().count,
          mostUsedMood,
        });

      } catch (e) {
        console.error("Error fetching stats: ", e);
      }
    };

    fetchStats();
  }, [currentUser]);

  const handleRotateId = async () => {
    setRotateId(true);
    try {
      await rotateEchoId();
    } catch (error) {
      console.error('Failed to rotate ID:', error);
    }
    setTimeout(() => {
      setRotateId(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Echo ID Section */}
      <div className="bg-surface dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Echo ID</h2>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:justify-between">
          <code className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-lg font-mono break-all dark:text-white">
            {echoId}
          </code>
          <button
            onClick={handleRotateId}
            disabled={rotateId}
            className={`px-4 py-2 rounded-lg ${
              rotateId
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                : 'bg-primary text-white hover:bg-secondary'
            } transition-colors`}
          >
            {rotateId ? 'Rotating...' : 'Rotate ID'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your Echo ID changes weekly for privacy. You can manually rotate it anytime.
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-surface dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Echoes</p>
            <p className="text-2xl font-semibold dark:text-white">{stats.totalEchoes}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Friends</p>
            <p className="text-2xl font-semibold dark:text-white">{stats.totalFriends}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Private Vibes</p>
            <p className="text-2xl font-semibold dark:text-white">{stats.privateVibes}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Most Used Mood</p>
            <p className="text-2xl font-semibold dark:text-white">{stats.mostUsedMood}</p>
          </div>
        </div>
      </div>

      {/* Friends List Section */}
      <div className="mb-8">
        <FriendsList />
      </div>

      {/* Settings Section */}
      <div className="bg-surface dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode appearance</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                isDarkMode ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  isDarkMode ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new echoes</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                notifications ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  notifications ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Auto-rotate ID</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically rotate ID weekly</p>
            </div>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                autoRotate ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  autoRotate ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 