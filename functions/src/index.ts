import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

exports.onUserStatusChanged = functions.database
  .ref('/status/{uid}')
  .onUpdate(async (change, context) => {
    // Get the data written to Realtime Database
    const eventStatus: any = change.after.val();

    // Then use other event data to create a reference to the
    // corresponding Firestore document.
    const userStatusFirestoreRef = db.doc(`status/${context.params.uid}`);

    // It is likely that the Realtime Database change that triggered
    // this event has already been overwritten by a fast change in
    // online / offline status, so we'll re-read the current data
    // and compare the timestamps.
    const statusSnapshot = await change.after.ref.once('value');
    const status = statusSnapshot.val();
    functions.logger.log(status, eventStatus);
    // If the current timestamp for this data is newer than
    // the data that triggered this event, we exit this function.
    if (status.last_changed > eventStatus.last_changed) {
      return null;
    }

    // Otherwise, we convert the last_changed field to a Date
    eventStatus.last_changed = new Date(eventStatus.last_changed);

    // ... and write it to Firestore.
    return userStatusFirestoreRef.set(eventStatus);
  });

exports.onFirebaseStatusUpdate = functions.firestore
  .document('status/{userId}')
  .onUpdate(async (change, context) => {
    // Get an object representing the document
    const newValue = change.after.data();
    const state = newValue.state;
    const userId: string = context.params.userId;

    console.log('state: ', state);

    // get user
    return await db
      .doc(`users/${userId}`)
      .get()
      .then(async (res: any) => {
        const user = res.data();
        // if user is in a group
        if (user) {
          console.log('user', user.username);
          if (state === 'offline') {
            if (user.groupId) {
              const groupId = user.groupId;
              console.log('group:', groupId);

              console.log('deleting participants');
              // delete user from participants
              await db
                .doc(`participants/${groupId}/participants/${userId}`)
                .delete();

              console.log('updating groupId for the user');
              // set groupId to null
              await db.doc(`users/${userId}`).update({ groupId: null });

              console.log('removing 1 participant from the group');
              // -1 from groups participants
              await db.doc(`groups/${groupId}`).update({
                participantsCount: FieldValue.increment(-1),
              });

              await db.doc(`mutedUsers/${userId}`).update({ mutedUserIds: [] });

              console.log('getting admin');
              // Get admin of the group
              const admin = await db
                .doc(`admins/${groupId}`)
                .get()
                .then((res: any) => {
                  return res.data();
                });

              console.log('getting participants');
              // Get participants
              //   const participants = await db
              //     .doc(`participants/${groupId}`)
              //     .listCollections();

              //   const participantIds = participants.map(async (participantsCol: any) => {
              //       const participantsDocs = await participantsCol.listDocuments();
              //       return participantsDocs.map(
              //         (participantDoc: any) => participantDoc.id
              //       );
              //     }
              //   );
              //   console.log('Got participants: ', participantIds);
              // Get participants
              // Get participants
              const snapshot = await db
                .collection('participants')
                .doc(groupId)
                .collection('participants')
                .get();

              const participants = snapshot.docs.map((doc: any) => doc.data());

              console.log('Got participants: ', participants[0]);

              if (participants.length !== 0) {
                if (admin) {
                  // Get a random participant
                  const participant =
                    participants[
                      Math.floor(Math.random() * participants.length)
                    ];
                  // set new admin
                  console.log('setting new admin');
                  await db
                    .doc(`admins/${groupId}`)
                    .set({ userId: participant.id });
                }
              } else {
                // delete group since there is no participants
                console.log('deleting group');
                await db.doc(`groups/${groupId}`).delete();
                console.log('deleting groupControls');
                await db.doc(`groupControls/${groupId}`).delete();
                console.log('deleting groupSettings');
                await db.doc(`groupSettings/${groupId}`).delete();
                console.log('deleting groupTime');
                await db.doc(`groupTime/${groupId}`).delete();
                console.log('deleting admins');
                await db.doc(`admins/${groupId}`).delete();
                console.log('deleting participants');
                await db.doc(`participants/${groupId}`).delete();

                console.log('deleting messages');
                const messages = await db
                  .doc(`messages/${groupId}`)
                  .listCollections();

                messages.map(async (message: any) => {
                  const messageDocs = await message.listDocuments();
                  messageDocs.map(async (messageDoc: any) => {
                    await db
                      .doc(`messages/${groupId}/messages/${messageDoc.id}`)
                      .delete();
                  });
                });
                await db.doc(`messages/${groupId}`).delete();

                console.log('deleting kicked users list');
                const kickedUsers = await db
                  .doc(`kickedUsers/${groupId}`)
                  .listCollections();

                kickedUsers.map(async (kickedUser: any) => {
                  const kickedUsersDocs = await kickedUser.listDocuments();
                  kickedUsersDocs.map(async (kickedUsersDoc: any) => {
                    await db
                      .doc(
                        `kickedUsers/${groupId}/kickedUsers/${kickedUsersDoc.id}`
                      )
                      .delete();
                  });
                });
                await db.doc(`kickedUsers/${groupId}`).delete();
              }
            }
          }
        }
      });
  });

// exports.scheduledDailyUpdate = functions.pubsub
//   .schedule('* * * * *')
//   .timeZone('America/New_York')
//   .onRun(async (context) => {
//     console.log('Daily record saving');
//     return await db
//       .collection('dailyRecord')
//       .get()
//       .then((querySnapshot: any) => {
//         querySnapshot.forEach(async (doc: any) => {
//           await doc.ref.get().then(async (res: any) => {
//             console.log('get doc data');
//             const recordData = res.data();

//             console.log(`update ${doc.ref.id} doc`);
//             await db
//               .collection('weeklyRecord')
//               .doc(doc.ref.id)
//               .update({
//                 dates: FieldValue.arrayUnion(context.timestamp),
//                 records: FieldValue.arrayUnion(recordData),
//               });
//           });
//           console.log('remove data from daily record');
//           await doc.ref.update({
//             pomodoros: 0,
//             tasks: [],
//             tasksComplited: 0,
//             tasksIds: [],
//             timeSpend: 0,
//           });
//         });
//       });
//   });

exports.scheduledDailyUpdate = functions.pubsub
  .schedule('55 23 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Daily record saving');
    return await db
      .collection('dailyRecord')
      .get()
      .then((querySnapshot: any) => {
        querySnapshot.forEach(async (doc: any) => {
          await doc.ref.get().then(async (res: any) => {
            console.log('get doc data');
            const recordData = res.data();

            console.log(
              'check if user has 7 days and delete last day to replace it'
            );
            await db
              .collection('weeklyRecord')
              .doc(doc.ref.id)
              .get()
              .then(async (res: any) => {
                const weeklyData = res.data();

                if (weeklyData.records.length === 7) {
                  console.log('remove first day');
                  const firstRecord = weeklyData.records[0];
                  const firstDate = weeklyData.dates[0];
                  const firstTime = firstRecord.timeSpend;
                  const firstPomodoros = firstRecord.pomodoros;
                  const firstTaskscomplited = firstRecord.tasksComplited;
                  db.collection('weeklyRecord')
                    .doc(doc.ref.id)
                    .update({
                      dates: FieldValue.arrayRemove(firstDate),
                      records: FieldValue.arrayRemove(firstRecord),
                      timeSpend: FieldValue.increment(-firstTime),
                      pomodoros: FieldValue.increment(-firstPomodoros),
                      tasksComplited: FieldValue.increment(
                        -firstTaskscomplited
                      ),
                    });
                }
              });

            console.log(`update ${doc.ref.id} doc`);
            await db
              .collection('weeklyRecord')
              .doc(doc.ref.id)
              .update({
                dates: FieldValue.arrayUnion(context.timestamp),
                records: FieldValue.arrayUnion(recordData),
              });
          });
          console.log('remove data from daily record');
          await doc.ref.update({
            pomodoros: 0,
            tasks: [],
            tasksComplited: 0,
            tasksIds: [],
            timeSpend: 0,
            updatedAt: Date.now(),
          });
        });
      });
  });
