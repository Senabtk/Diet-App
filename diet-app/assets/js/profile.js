var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};

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

  setTimeout(function () {
    alertPlaceholder.innerHTML = "";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var userId = user.uid;
      firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .get()
        .then(function (doc) {
          if (doc.exists) {
            if (loadingSpinner) {
              loadingSpinner.style.display = "none";
            } else {
              if (loadingSpinner) {
                loadingSpinner.style.display = "none";
              }
              showAlert("Kullanıcı verisi bulunamadı.", "error");
            }

            var nameElem = document.getElementById("name");
            var ageElem = document.getElementById("age");
            var weightElem = document.getElementById("weight");
            var genderElem = document.getElementById("gender");
            var emailElem = document.getElementById("email");

            if (nameElem) nameElem.value = doc.data().name || "";
            if (ageElem) ageElem.value = doc.data().age || "";
            var dietGoalElem = document.getElementById("dietGoal");
            if (dietGoalElem)
              dietGoalElem.value = doc.data().dietGoal || "Select Diet Goal";
            if (weightElem) weightElem.value = doc.data().weight || "";
            if (genderElem)
              genderElem.value = doc.data().gender || "Select Gender";
            if (emailElem) emailElem.value = user.email; // Only set if emailElem exists
            doc.data().point || 0;
          } else {
            showAlert("Kullanıcı verisi bulunamadı.", "error");
          }
        })
        .catch(function (error) {
          if (loadingSpinner) {
            loadingSpinner.style.display = "none";
          }
          showAlert(
            "Kullanıcı verileri alınırken hata: " + error.message,
            "error"
          );
        });
    } else {
      redirectToIndex();
    }
  });

  // Update profile form submission
  document
    .getElementById("registerForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      var user = firebase.auth().currentUser;
      if (user) {
        var updatedData = {
          name: document.getElementById("name").value,
          age: document.getElementById("age").value,
          weight: document.getElementById("weight").value,
          gender: document.getElementById("gender").value,
          dietGoal: document.getElementById("dietGoal").value,
        };

        firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .update(updatedData)
          .then(function () {
            showAlert("Profil başarıyla güncellendi!", "success");
          })
          .catch(function (error) {
            console.error("Profil güncellenirken hata oluştu: ", error);
            showAlert(
              "Profil güncellenirken hata oluştu: " + error.message,
              "error"
            );
          });
      }
    });
});
