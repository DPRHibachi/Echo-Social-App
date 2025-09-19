import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Friend {
  id: string; // This will be the friend's user ID
  echoId: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { currentUser, echoId } = useAuth();
  const { isDarkMode } = useTheme();

  // Fetch user's friends from the friends array in their document
  useEffect(() => {
    if (!currentUser) {
        setFriends([]);
        return;
    }

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
                  echoId: friendDoc.data().echoId || 'N/A' // Get echoId from friend's user document
              }));
              setFriends(friendsData);
          } else {
              setFriends([]); // No friends in the array
          }
        } else {
          setFriends([]); // friends field is missing or not an array
        }
      } else {
        setFriends([]); // User document doesn't exist
      }
    }, (err) => {
        console.error("Error fetching friends from user document: ", err);
        setError("Failed to fetch friends.");
        setFriends([]);
    });

    return () => unsubscribe();
  }, [currentUser]); // Re-run effect if currentUser changes

  const handleAddFriend = async () => {
    setError(null);
    setMessage(null);
    if (!inviteCodeInput.trim()) {
      setError('Please enter an invite code.');
      return;
    }
    if (!currentUser || !echoId) {
      setError('User not authenticated.');
      return;
    }

    // Prevent adding self
    if (inviteCodeInput === echoId) {
      setError('You cannot add yourself as a friend.');
      setInviteCodeInput('');
      return;
    }

    try {
      // Find the user with the matching invite code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('echoId', '==', inviteCodeInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No user found with that invite code.');
        setInviteCodeInput('');
        return;
      }

      // Assuming only one user per echoId
      const friendDoc = querySnapshot.docs[0];
      const friendUserId = friendDoc.id;
      const friendEchoId = friendDoc.data().echoId;

      // Add friend's user ID to current user's friends array (One-way follow)
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserDocRef, {
         friends: arrayUnion(friendUserId)
      });

      // Optional: Add current user's ID to friend's friends array (for mutual friendship)
      // **Commented out for one-way follow based on current rules**
      // const friendUserDocRef = doc(db, 'users', friendUserId);
      //  await updateDoc(friendUserDocRef, {
      //     friends: arrayUnion(currentUser.uid)
      //  });

      setMessage(`Added ${friendEchoId} to your friends.`);
      setInviteCodeInput('');

    } catch (e: any) {
      console.error("Error adding friend: ", e);
      setError(`Error adding friend: ${e.message}`);
    }
  };

    const handleRemoveFriend = async (friendId: string) => {
        if (!currentUser) return;
        try {
            // Remove friend's user ID from current user's friends array (One-way unfollow)
            const currentUserDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(currentUserDocRef, {
                friends: arrayRemove(friendId)
            });

            // Optional: Remove current user's ID from friend's friends array
            // **Commented out for one-way unfollow based on current rules**
            // const friendUserDocRef = doc(db, 'users', friendId);
            //  await updateDoc(friendUserDocRef, {
            //       friends: arrayRemove(currentUser.uid)
            //  });

        } catch (e: any) {
            console.error("Error removing friend: ", e);
            setError(`Error removing friend: ${e.message}`);
        }
    };

  return (
    <div className="container mx-auto px-4 py-8 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Friends</h1>

      {/* My Echo ID */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Your Echo ID</h2>
        <p className="text-lg font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded-md inline-block">{echoId}</p>
      </div>

      {/* Add Friend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Add Friend by Echo ID</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            placeholder="Enter friend's Echo ID"
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleAddFriend}
            className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-secondary transition-colors dark:bg-primary-dark dark:hover:bg-secondary-dark"
          >
            Add Friend
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-500 dark:text-green-400 text-sm mt-2">{message}</p>}
      </div>

      {/* Friends List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No friends added yet.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map(friend => (
              <li key={friend.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <span className="text-gray-800 dark:text-gray-200">{friend.echoId}</span>
                <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                >
                    Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friends; 