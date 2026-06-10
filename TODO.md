Help me rebuild the app with following flow:

1. Landing Page: use Gsap for animation. Create a typical CM office setup(use nano banana to create base image) with a paper on the table. we will have to overlay a '?' symbol on that paper and animate it.

2. Login: use the same '?' symbol from that page and transform it into a login button (firebase assistet google login). Remove all the background and make this '?' symbol the main focus. Use neon colors for it. make it more vibrant

3. Poll Card: Once the user logs in, show them only 1 poll with options at the bottom, if the user chooses to answer, turn the card around to show the results as well as comments for that poll. Provide user option to comment on the bottom. Provide option to navigate to previous or next poll and end the polls.

4. Once user decided to exit, provide them a dialog box to add their own question. For admins, there should be a option to approve or reject the question. 

5. Make sure to build a profile section for each users to see their past polls and comment.

6. Make sure to build an admin section for users and questions management.


We are user firebase for all user and admin related data. Make sure to help me with appropriate firebase rules for same.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlczvOQyesUsVOC_ozvdHk9pvnsIVb2E8",
  authDomain: "pubicpoll.firebaseapp.com",
  projectId: "pubicpoll",
  storageBucket: "pubicpoll.firebasestorage.app",
  messagingSenderId: "856457315184",
  appId: "1:856457315184:web:c864313c5b94c097a645b5",
  measurementId: "G-B18Y1F9SB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);