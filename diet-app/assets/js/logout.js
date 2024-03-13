var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};
firebase.initializeApp(firebaseConfig);

document.getElementById("logoutButton").addEventListener("click", function (e) {
  e.preventDefault();

  firebase
    .auth()
    .signOut()
    .then(function () {
      localStorage.removeItem("dToken");
      window.location.href = "login.html";
    })
    .catch(function (error) {
      console.error("Logout error: ", error);
    });
});
