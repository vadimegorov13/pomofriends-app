import { db } from '../firebase/firebase';
import { GroupParticipant } from '../utils/types/groupTypes';
import { useParticipantsType } from '../utils/types/hookTypes';
import firebase from 'firebase/compat/app';
import { useAuth } from './useAuth';
import { notification } from '../utils/notification';
import { UserData } from '../utils/types/userTypes';

export const useParticipants = (): useParticipantsType => {
  const { user } = useAuth();
  const FieldValue = firebase.firestore.FieldValue;

  const getParticipants = (
    groupId: string,
    setParticipants: any,
    isSubscribed: boolean
  ) => {
    try {
      db.collection('participants')
        .doc(groupId)
        .collection('participants')
        .orderBy('username')
        .onSnapshot((querySnapShot) => {
          const data = querySnapShot.docs.map((doc) => ({
            ...doc.data(),
          }));
          if (isSubscribed) {
            setParticipants(data as GroupParticipant[]);
          }
        });
    } catch (error) {
      console.log("Couldn't get messages");
    }
  };

  const getAdmin = (groupId: string, setAdmin: any, isSubscribed: boolean) => {
    try {
      db.collection('admins')
        .doc(groupId)
        .onSnapshot((querySnapshot) => {
          const data = querySnapshot.data();

          if (isSubscribed && data) {
            setAdmin(data?.userId);
          }
        });
    } catch (error) {
      console.log("Couldn't get admin");
    }
  };

  const changeAdmin = async (groupId: string, userId: string) => {
    try {
      const adminUsername = await db
        .collection('users')
        .doc(userId)
        .get()
        .then((res) => {
          const newAdmin = res.data() as UserData;
          return newAdmin.username;
        });
      await db.collection('admins').doc(groupId).set({ userId: userId });
      notification({
        title: 'The new group admin is',
        message: adminUsername,
        color: 'green',
      });
    } catch (error) {
      console.log("Couldn't set admin");
    }
  };

  const kickUser = async (groupId: string, userId: string) => {
    try {
      const kickedUsername = await db
        .collection('users')
        .doc(userId)
        .get()
        .then((res) => {
          const newAdmin = res.data() as UserData;
          return newAdmin.username;
        });

      await db
        .collection('participants')
        .doc(groupId)
        .collection('participants')
        .doc(userId)
        .delete();

      await db.collection('users').doc(userId).update({ groupId: null });

      await db
        .collection('groups')
        .doc(groupId)
        .update({
          participantsCount: FieldValue.increment(-1),
        });

      await db
        .collection('kickedUsers')
        .doc(groupId)
        .collection('kickedUsers')
        .doc(userId)
        .set({ id: userId, kicked: true });

      notification({
        title: `You've kicked ${kickedUsername} from the group`,
        message: '',
        color: 'green',
      });
    } catch (error) {
      console.log("Couldn't kick user");
    }
  };

  const muteUser = async (userId: string) => {
    if (user) {
      try {
        const mutedUsername = await db
          .collection('users')
          .doc(userId)
          .get()
          .then((res) => {
            const newAdmin = res.data() as UserData;
            return newAdmin.username;
          });
        await db
          .collection('mutedUsers')
          .doc(user.id)
          .update({
            mutedUserIds: FieldValue.arrayUnion(userId),
          })
          .then(() => {
            notification({
              title: `You've muted ${mutedUsername}`,
              message: 'You will no longer see their messages',
              color: 'green',
            });
          });
      } catch (error) {
        console.log("Couldn't mute user");
      }
    }
  };

  const unmuteUser = async (userId: string) => {
    if (user) {
      try {
        const mutedUsername = await db
          .collection('users')
          .doc(userId)
          .get()
          .then((res) => {
            const newAdmin = res.data() as UserData;
            return newAdmin.username;
          });
        await db
          .collection('mutedUsers')
          .doc(user.id)
          .update({
            mutedUserIds: FieldValue.arrayRemove(userId),
          })
          .then(() => {
            notification({
              title: `You've unmuted ${mutedUsername}`,
              message: 'You will now see their messages',
              color: 'green',
            });
          });
      } catch (error) {
        console.log("Couldn't unmunte user");
      }
    }
  };

  const getMutedUser = (setMuted: any, isSubscribed: boolean) => {
    if (user) {
      try {
        db.collection('mutedUsers')
          .doc(user.id)
          .onSnapshot((querySnapshot) => {
            const data = querySnapshot.data();

            if (isSubscribed && data) {
              setMuted(data.mutedUserIds);
            }
          });
      } catch (error) {
        console.log("Couldn't get admin");
      }
    }
  };

  const reportUser = async (userId: string, reason: string) => {
    if (user) {
      try {
        const report = db.collection('reportedUsers').doc();
        await report
          .set({
            id: report.id,
            reason: reason,
            reportedUser: userId,
            reportBy: user.id,
            reportedAt: Date.now(),
          })
          .then(() => {
            notification({
              title: `We have received your report`,
              message: '',
              color: 'green',
            });
          });
      } catch (error) {
        console.log("Couldn't report user");
      }
    }
  };

  return {
    getParticipants,
    getAdmin,
    changeAdmin,
    kickUser,
    muteUser,
    unmuteUser,
    getMutedUser,
    reportUser,
  };
};
