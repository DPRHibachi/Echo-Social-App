import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface PrivateVibe {
  id: string;
  content: string;
  mood: string;
  timestamp: Date;
  isShared: boolean;
  userId: string;
}

const PrivateVibes: React.FC = () => {
  const [vibes, setVibes] = useState<PrivateVibe[]>([]);
  const [newVibeContent, setNewVibeContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { currentUser, echoId } = useAuth();
  const { isDarkMode } = useTheme();

  const moods = ['😊', '😢', '😡', '😴', '🤔', '🎉', '💪', '❤️'];

  // Fetch user's private vibes
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'privateVibes'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vibesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<PrivateVibe, 'id' | 'timestamp'>, // Corrected Omit type
        timestamp: doc.data().timestamp.toDate() // Convert Firestore Timestamp to Date
      }));
      setVibes(vibesData);
    }, (err) => {
        console.error("Error fetching private vibes: ", err);
        setError("Failed to fetch private vibes.");
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddVibe = async (shareToEcho: boolean) => {
    setError(null);
    setMessage(null);
    if (!newVibeContent.trim()) {
      setError('Please enter some content for your vibe.');
      return;
    }
    if (!currentUser || !echoId) {
        setError('User not authenticated or Echo ID not available.');
        return;
    }

    try {
      const vibeData = {
        content: newVibeContent,
        mood: selectedMood,
        timestamp: Timestamp.now(),
        isShared: shareToEcho,
        userId: currentUser.uid,
        echoId: echoId
      };

      // Add to privateVibes collection
      await addDoc(collection(db, 'privateVibes'), vibeData);

      // If sharing to Echo, also add to echoes collection
      if (shareToEcho) {
          const echoData = {
              content: newVibeContent,
              mood: selectedMood,
              timestamp: Timestamp.now(),
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              isPrivate: false,
              userId: currentUser.uid,
              echoId: echoId
          };
         await addDoc(collection(db, 'echoes'), echoData);
      }

      setMessage(shareToEcho ? 'Vibe shared to Echo!' : 'Private vibe saved.');
      setNewVibeContent('');

    } catch (e: any) {
      console.error("Error adding vibe: ", e);
      setError(`Error saving vibe: ${e.message}`);
    }
  };

  const handleDeleteVibe = async (vibeId: string) => {
      setError(null);
      setMessage(null);
      if (!currentUser) return;

      try {
          // Note: This only deletes from privateVibes. If shared to Echo, it remains there.
          await deleteDoc(doc(db, 'privateVibes', vibeId));
          setMessage('Private vibe deleted.');
      } catch (e: any) {
          console.error("Error deleting vibe: ", e);
          setError(`Error deleting vibe: ${e.message}`);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Private Vibes</h1>

      {/* Create Private Vibe */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">New Private Vibe</h2>
        <textarea
          value={newVibeContent}
          onChange={(e) => setNewVibeContent(e.target.value)}
          placeholder="Write your private thoughts..."
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          rows={4}
        />
        
        <div className="flex flex-wrap gap-2 mt-4">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`p-2 rounded-full ${
                selectedMood === mood ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={() => handleAddVibe(false)} // Save as private
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Save as Private
          </button>
          <button
            onClick={() => handleAddVibe(true)} // Share to Echo
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors dark:bg-primary-dark dark:hover:bg-secondary-dark"
          >
            Share to Echo
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}

      </div>

      {/* Private Vibes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Your Private Vibes</h2>
        {vibes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No private vibes saved yet.</p>
        ) : (
          <ul className="space-y-4">
            {vibes.map(vibe => (
              <li key={vibe.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-2xl">{vibe.mood}</span>
                   <span className="text-sm text-gray-500 dark:text-gray-400">
                     {vibe.timestamp.toLocaleString()}
                   </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 mb-2 break-words">{vibe.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{vibe.isShared ? 'Shared to Echo' : 'Private'}</span>
                     <button
                        onClick={() => handleDeleteVibe(vibe.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                    >
                        Delete
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PrivateVibes; 