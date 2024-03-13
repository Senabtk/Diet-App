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

function showAlert(message, type) {
  var alertPlaceholder = document.getElementById("alertPlaceholder");
  var alertType = type === "success" ? "alert-success" : "alert-danger";
  var alertHTML = `
      <div class="alert ${alertType} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;
  alertPlaceholder.innerHTML = alertHTML;
}

var registerForm = document.getElementById("registerForm");
var nameInput = document.getElementById("name");
var ageInput = document.getElementById("age");
var weightInput = document.getElementById("weight");
var genderSelect = document.getElementById("gender");
var emailInput = document.getElementById("email");
var passwordInput = document.getElementById("password");
var googleSignInButton = document.getElementById("googleSignInButton");
var dietGoal = document.getElementById("dietGoal");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var name = nameInput.value;
  var age = ageInput.value;
  var weight = weightInput.value;
  var gender = genderSelect.value;
  var goal = dietGoal.value;
  var email = emailInput.value;
  var password = passwordInput.value;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      var userId = userCredential.user.uid;

      firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .set({
          name: name,
          age: age,
          weight: weight,
          gender: gender,
          goal: goal,
          email: email,
          password: password,
          point: 0,
        })
        .then(function () {
          localStorage.setItem("dToken", userCredential.user.refreshToken);
          setTimeout(() => {
            redirectToIndex();
          }, 2000);
          showAlert("Registration successful!", "success");
        })
        .catch((error) => {
          console.error("Error creating user: ", error);
          showAlert("Error: " + error.message, "error");
        });
    })
    .catch((error) => {
      console.error("Error creating user: ", error);
      showAlert("Error: " + error.message, "error");
    });
});

googleSignInButton.addEventListener("click", function () {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function () {
      localStorage.setItem("dToken", userCredential.user.refreshToken);
      setTimeout(() => {
        redirectToIndex();
      }, 2000); // Use setTimeout instead of setInterval
      showAlert("Registration successful!", "success");
    })
    .catch((error) => {
      console.error("Error during Google sign-in: ", error);
    });
});
