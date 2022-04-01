import firebase from 'firebase/compat/app';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth, db, realtimedb } from '../firebase/firebase';
import { SignInData, SignUpData } from '../utils/types/formTypes';
import {
  authContextDefaultValues,
  authContextType,
} from '../utils/types/hookTypes';
import {
  PomodoroSettingsDefaultValues,
  UserData,
  UserSettingsDefaultValues,
} from '../utils/types/userTypes';
import { useRouter } from 'next/router';

const AuthContext = createContext<authContextType>(authContextDefaultValues);

/**
 *
 * @param {{ children: ReactNode }} props
 * @return {JSX.Element}
 *
 * AuthProvider is a wrapper that provides a way to share
 * values between components without having to explicitly pass a prop
 * through every level of the tree. Or simply a context.
 */
export const AuthProvider = (props: { children: ReactNode }): JSX.Element => {
  const auth = useAuthProvider();
  // console.log('useAuthProviderrrrr', auth.user);
  return (
    <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>
  );
};

/**
 *
 * @return {authContextType}
 *
 * Context hook
 */
export const useAuth = (): authContextType => {
  return useContext(AuthContext);
};

/**
 *
 * @return {authContextType}
 *
 * Provider hook that creates an auth object and handles it's state.
 */
export const useAuthProvider = (): authContextType => {
  const router = useRouter();
  // Create a state for the user
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setLoading] = useState<boolean>(true);
  const [update, setUpdate] = useState(0);

  const handleUpdate = () => {
    setUpdate(+1);
  };

  const onConnect = (uid: string) => {
    const userStatusDatabaseRef = realtimedb.ref('/status/' + uid);
    const userStatusFirestoreRef = firebase.firestore().doc('/status/' + uid);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    };
    const isOnlineForDatabase = {
      state: 'online',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    const isOfflineForFirestore = {
      state: 'offline',
      last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const isOnlineForFirestore = {
      state: 'online',
      last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    realtimedb.ref('.info/connected').on('value', (snapshot) => {
      // If we're not currently connected, don't do anything.
      if (snapshot.val() == false) {
        userStatusFirestoreRef.set(isOfflineForFirestore);
        return;
      }

      // If we are currently connected, then use the 'onDisconnect()'
      // method to add a set which will only trigger once this
      // client has disconnected by closing the app,
      // losing internet, or any other means.
      userStatusDatabaseRef
        .onDisconnect()
        .set(isOfflineForDatabase)
        .then(() => {
          // The promise returned from .onDisconnect().set() will
          // resolve as soon as the server acknowledges the onDisconnect()
          // request, NOT once we've actually disconnected:
          // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

          // We can now safely set ourselves as 'online' knowing that the
          // server will mark us as offline once we lose connection.
          userStatusDatabaseRef.set(isOnlineForDatabase);
          userStatusFirestoreRef.set(isOnlineForFirestore);
        });
    });
  };

  /**
   *
   * @param {UserData} user
   * @return {Promise<any>} user or error
   *
   * Function that creates a doc for the user in database.
   */
  const createUser = async (user: UserData): Promise<any> => {
    const newUser = await db
      .collection('users')
      .doc(user.id)
      .set(user)
      .then(() => {
        setUser(user);
        return user;
      });

    if (newUser) {
      // Create settings, tasks, and pomodoroSettings docs with the same id as user
      db.collection('userSettings')
        .doc(newUser.id)
        .set(UserSettingsDefaultValues);
      db.collection('tasks').doc(newUser.id).set({});
      db.collection('pomodoroSettings')
        .doc(newUser.id)
        .set(PomodoroSettingsDefaultValues);
    } else {
      return { error: 'Something went wrong!' };
    }

    return newUser;
  };

  /**
   *
   * @param {UserData} user
   * @return {Promise<void>} return user or change the state of the user
   *
   * Returns user data from the firestore db.
   */
  const getUserAdditionalData = async (user: UserData): Promise<void> => {
    return await db
      .collection('users')
      .doc(user?.id)
      .get()
      .then(async (userData) => {
        if (userData.data()) {
          // Change the state of the user
          const user = userData.data() as UserData;
          onConnect(user.id);
          setUser(user);
        } else {
          // Create user if they do not have the doc in db
          createUser({
            id: user!.id,
            username: user!.username,
            email: user!.email,
            profilePic: user!.profilePic,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            groupId: null,
            currentTaskId: null,
          });
        }
      });
  };

  /**
   *
   * @param {SignUpData} { username, email, password }
   * @return {Promise<any>} user or error
   *
   * Sign up the user and create a doc for the user.
   *
   */
  const signUp = async ({
    username,
    email,
    password,
  }: SignUpData): Promise<any> => {
    return await auth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        auth.currentUser?.sendEmailVerification();
        if (response.user)
          return createUser({
            id: response.user.uid,
            username: username,
            email: email,
            profilePic: `https://avatars.dicebear.com/api/jdenticon/${response.user.uid}.svg`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            groupId: null,
            currentTaskId: null,
          });
      })
      .catch((error) => {
        return { error };
      });
  };

  /**
   *
   * @param {SignInData} { email, password }
   * @return {Promise<any>} user or error
   *
   * Sign in the user and get additional data of the user.
   *
   */
  const signIn = async ({ email, password }: SignInData): Promise<any> => {
    return await auth
      .signInWithEmailAndPassword(email, password)
      .then(async (response) => {
        const userResponse = response.user;

        // Change the state of the user
        const userData: UserData = {
          id: userResponse!.uid,
          username: userResponse!.displayName!,
          email: userResponse!.email!,
          profilePic: userResponse!.photoURL!,
          groupId: null,
          currentTaskId: null,
        };

        // setUser(userData);
        await getUserAdditionalData(userData);
        return userData;
      })
      .catch((error) => {
        return { error };
      });
  };

  /**
   *
   * @return {Promise<void>}
   *
   * Sign out the user.
   * Change the state of the user to null.
   *
   */
  const signOut = async (): Promise<void> => {
    // Change the state of the user
    if (user === null) return;

    // if (user.groupId) {
    //   await db
    //     .collection('participants')
    //     .doc(user.groupId)
    //     .collection('participants')
    //     .doc(user.id)
    //     .delete();

    //   await db.collection('users').doc(user.id).update({ groupId: null });

    //   await db
    //     .collection('groups')
    //     .doc(user.groupId)
    //     .update({
    //       participantsCount: firebase.firestore.FieldValue.increment(-1),
    //     });
    //   handleUpdate();
    // }

    return await auth.signOut().then(async () => {
      await realtimedb.ref('/status/' + user.id).set({
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
      });
      setUser(null);
      router.push('/');
    });
  };

  /**
   *
   * @param {string} email
   * @return {Promise<void>}
   *
   * Send password reset email.
   *
   */
  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    return await auth.sendPasswordResetEmail(email).then((response) => {
      return response;
    });
  };

  /**
   *
   * @param {UserData} user
   * @return {Promise<void>}
   *
   * Keeps user logged in.
   * When user re-enters the application, we need to fetch additional data again.
   *
   */
  const handleAuthStateChanged = async (
    user: UserData | null
  ): Promise<void> => {
    // console.log('handleAuthStateChanged', user);
    // Change the state of the user
    // setUser(user);
    if (user) {
      await getUserAdditionalData(user);
    }
    setLoading(false);
  };

  /**
   *  Observer for changes to the user's sign-in state
   */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user === null) {
        handleAuthStateChanged(user);
      } else {
        const userData: UserData = {
          id: user.uid,
          username: user!.displayName!,
          email: user!.email!,
          profilePic: user!.photoURL!,
          groupId: null,
          currentTaskId: null,
        };
        handleAuthStateChanged(userData);
      }
    });

    return () => unsub();
  }, []);

  /**
   * Makes sure that whenever the user’s document is updated,
   * we also update the user state in our application.
   */
  useEffect(() => {
    // console.log('update');
    if (user?.id) {
      // Subscribe to user document on mount

      const unsubscribe = db
        .collection('users')
        .doc(user.id)
        .onSnapshot((doc) => setUser(doc.data() as any));
      return () => unsubscribe();
    }
  }, [update]);

  return {
    user,
    userLoading,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    handleUpdate,
  };
};
