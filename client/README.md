# Open Summer of Code selection tool

## Prerequisites

- Node v12 installed
- You must be added to either the osoc selection tool [Firebase](https://firebase.google.com/) instance, or create your own.
If you create your own, replace `firebaseConfig` in  `src/firebase.js` with your own values. The [data transformer and import scripts](https://github.com/opensummerofcode/selections-data-transformer) can help you transform your data into a format the tool expects. Your Firebase instance must have Google authentication enabled, and you must deploy firebase functions for user creation to work: `firebase deploy --only functions`
- On first sign-in as the first user, you will manually have to set yourself to `admin` in the `users` collection through a script or the Firebase console.

### Install dependencies

Run `npm install` in the project directory to install dependencies.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder. You can deploy the build by running `firebase deploy`
