import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Friend {
  id: string;
  echoId: string;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendId, setNewFriendId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData.friends && Array.isArray(userData.friends)) {
          // Fetch details for each friend ID in the array
          const friendIds = userData.friends;
          if (friendIds.length > 0) {
            const friendsQuery = query(collection(db, 'users'), where('__name__', 'in', friendIds));
            const friendsSnapshot = await getDocs(friendsQuery);
            const friendsData: Friend[] = friendsSnapshot.docs.map(friendDoc => ({
              id: friendDoc.id,
              echoId: friendDoc.data().echoId || 'N/A'
            }));
            setFriends(friendsData);
          } else {
            setFriends([]);
          }
        } else {
          setFriends([]);
        }
      }
    }, (err) => {
      console.error("Error fetching friends: ", err);
      setError("Failed to fetch friends.");
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddFriend = async () => {
    setError(null);
    setMessage(null);
    if (!currentUser || !newFriendId.trim()) {
      setError('Please enter an Echo ID');
      return;
    }

    try {
      // Check if the friend exists in the users collection
      const usersQuery = query(
        collection(db, 'users'),
        where('echoId', '==', newFriendId.trim())
      );
      const userSnapshot = await getDocs(usersQuery);

      if (userSnapshot.empty) {
        setError('No user found with this Echo ID');
        return;
      }

      const potentialFriend = userSnapshot.docs[0];
      
      // Don't allow adding yourself
      if (potentialFriend.id === currentUser.uid) {
        setError('You cannot add yourself as a friend');
        return;
      }

      // Update the user's document to add the friend
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(potentialFriend.id)
      });

      setMessage('Friend added successfully!');
      setNewFriendId('');
    } catch (e: any) {
      console.error("Error adding friend: ", e);
      setError(`Error adding friend: ${e.message}`);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    setError(null);
    setMessage(null);
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendId)
      });
      setMessage('Friend removed successfully!');
    } catch (e: any) {
      console.error("Error removing friend: ", e);
      setError(`Error removing friend: ${e.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Friends</h2>
      
      {/* Add Friend Form */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            placeholder="Enter Echo ID"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleAddFriend}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors dark:bg-primary-dark dark:hover:bg-secondary-dark"
          >
            Add Friend
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}
      </div>

      {/* Friends List */}
      <div className="space-y-2">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200">{friend.echoId}</span>
            </div>
            <button
              onClick={() => handleRemoveFriend(friend.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        {friends.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No friends added yet</p>
        )}
      </div>
    </div>
  );
};

export default FriendsList; 