importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');

var firebaseConfig = {
		apiKey: "AIzaSyDQirIDv80g37XF7h7_zfzZRFnDoyqsTr8",
		authDomain: "realvue-app.firebaseapp.com",
		databaseURL: "https://realvue-app.firebaseio.com",
		projectId: "realvue-app",
		storageBucket: "realvue-app.appspot.com",
		messagingSenderId: "245849698031",
		appId: "1:245849698031:web:9b4bf004d3195cf54fb51a",
		measurementId: "G-RSDBZJJLZQ"
	  };
	  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();



/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/7.11.0/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/7.11.0/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/



// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

	// Customize notification here
  const notificationTitle = 'RealVue';
  const notificationOptions = {
    body: 'RealVue needs to refresh this display system.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
// [END background_handler]