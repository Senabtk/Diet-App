var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};
// Initialize Firebase
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

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  var email = document.getElementById("exampleInputEmail1").value;
  var password = document.getElementById("exampleInputPassword1").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      localStorage.setItem("dToken", userCredential.user.refreshToken);
      showAlert("Giriş başarılı!", "success");
      setTimeout(() => {
        redirectToIndex();
      }, 2000);
    })
    .catch((error) => {
      showAlert("Kullanıcı adı veya şifre yanlış");
    });
});
