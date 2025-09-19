import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Echo {
  id: string;
  content: string;
  mood: string;
  echoId: string;
  timestamp: Date;
  backgroundColor: string;
  isPrivate: boolean;
  userId: string;
}

const Home: React.FC = () => {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [newEcho, setNewEcho] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, echoId } = useAuth();
  const { isDarkMode } = useTheme();

  const moods = ['😊', '😢', '😡', '😴', '🤔', '🎉', '💪', '❤️'];
  const colors = ['#ffffff', '#fef3c7', '#dbeafe', '#f3e8ff', '#dcfce7'];
  const echoesPerPage = 6;

  useEffect(() => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const q = query(
      collection(db, 'echoes'),
      where('timestamp', '>=', twentyFourHoursAgo),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const echoesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<Echo, 'id' | 'timestamp'>,
        timestamp: doc.data().timestamp.toDate()
      }));
      setEchoes(echoesData);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  const handlePostEcho = async () => {
    if (newEcho.trim() && currentUser && echoId) {
      try {
        await addDoc(collection(db, 'echoes'), {
          content: newEcho,
          mood: selectedMood,
          echoId: echoId,
          timestamp: new Date(),
          backgroundColor: selectedColor,
          isPrivate: isPrivate,
          userId: currentUser.uid
        });
        setNewEcho('');
        setIsPrivate(false);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  // Calculate pagination
  const indexOfLastEcho = currentPage * echoesPerPage;
  const indexOfFirstEcho = indexOfLastEcho - echoesPerPage;
  const currentEchoes = echoes.slice(indexOfFirstEcho, indexOfLastEcho);
  const totalPages = Math.ceil(echoes.length / echoesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Create Echo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 sm:p-6 mb-8">
        <textarea
          value={newEcho}
          onChange={(e) => setNewEcho(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
          rows={3}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`p-2 rounded-full ${selectedMood === mood ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                {mood}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border ${
                  selectedColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300 dark:border-gray-700'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="privateVibe"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="mr-2 focus:ring-primary dark:focus:ring-primary-dark text-primary dark:text-primary-dark"
          />
          <label htmlFor="privateVibe" className="text-sm text-gray-600 dark:text-gray-300">
            Make this a private vibe
          </label>
        </div>

        <button
          onClick={handlePostEcho}
          className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors dark:bg-primary-dark dark:hover:bg-secondary-dark"
        >
          Echo
        </button>
      </div>

      {/* Echo Feed */}
      <div className="space-y-4">
        {currentEchoes.map((echo) => (
          <div
            key={echo.id}
            className={`rounded-lg shadow-md dark:shadow-lg p-4 sm:p-6 ${
               isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            style={!isDarkMode ? { backgroundColor: echo.backgroundColor } : {}}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{echo.echoId}</span>
              <div className="flex items-center gap-2">
                {echo.isPrivate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">🔒 Private</span>
                )}
                <span className="text-2xl mt-2 sm:mt-0">{echo.mood}</span>
              </div>
            </div>
            <p className="text-lg break-words text-gray-800 dark:text-gray-200">{echo.content}</p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {echo.timestamp instanceof Date ? echo.timestamp.toLocaleString() : 'Invalid Date'}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {echoes.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            These echoes refresh every 24 hours. Read them before they fade away!
          </p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === pageNum
                    ? 'bg-primary text-white border-primary'
                    : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                disabled={pageNum > totalPages}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 