const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createUser = functions.auth.user().onCreate((user) => {
  const newUser = {
    email: user.email,
    displayName: user.displayName,
    uid: user.uid,
    admin: false,
    pending: true
  };
  return admin
    .firestore()
    .collection('users')
    .doc(user.uid)
    .set(newUser)
    .then(() => ({
      message: `Account for ${newUser.displayName} successfully created.`
    }))
    .catch((err) => err);
});
