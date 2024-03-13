var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};

const db = firebase.firestore();
const dietCardsContainer = document.getElementById("dietCards");
const loadingSpinner = document.getElementById("loadingSpinner");

document.addEventListener("DOMContentLoaded", function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const userId = user.uid;

      db.collection("users")
        .doc(userId)
        .get()
        .then(function (doc) {
          if (doc.exists) {
            const userGoal = doc.data().dietGoal;
            loadingSpinner.style.display = "none";

            if (userGoal === "loseWeight") {
              displayDietCards("Zayıflamak için Diet Önerileri", [
                "7 Günlük Su Dieti.pdf",
                "7 Günlük Yoğurt Dieti.pdf",
                "7 Günlük Yumurta Dieti.pdf",
                "Düşük Karbonhidrat Yüksek Protein Diyeti.pdf",
                "Haftalık Ortalama 2 Kilo.pdf",
              ]);
            } else if (userGoal === "gainWeight") {
              displayDietCards("Kilo Almak için Diet Önerileri", [
                "Yüksek Karbonhidrat ve Yüksek Protein.pdf",
                "3 Ana 3 Ara Diyeti.pdf",
                "Yağsiz Kilo Alma.pdf",
                "250 - 300 kkal Ek Yaparak Kilo Alma.pdf",
              ]);
            } else {
              // If not specified, show a default set of cards
              displayDietCards("Zayıflamak için Diet Önerileri", [
                "7 Günlük Su Dieti.pdf",
                "7 Günlük Yoğurt Dieti.pdf",
                "7 Günlük Yumurta Dieti.pdf",
                "Düşük Karbonhidrat Yüksek Protein Diyeti.pdf",
                "Haftalık Ortalama 2 Kilo.pdf",
              ]);
              displayDietCards("Kilo Almak için Diet Önerileri", [
                "Yüksek Karbonhidrat ve Yüksek Protein.pdf",
                "3 Ana 3 Ara Diyeti.pdf",
                "Yağsiz Kilo Alma.pdf",
                "250 - 300 kkal Ek Yaparak Kilo Alma.pdf",
              ]);
            }
          } else {
            loadingSpinner.style.display = "none";
          }
        })
        .catch(function (error) {
          loadingSpinner.style.display = "none";
        });
    }
  });
});

function displayDietCards(title, pdfList) {
  const titleElement = document.createElement("h3");
  titleElement.textContent = title;
  dietCardsContainer.appendChild(titleElement);

  pdfList.forEach(function (pdfName) {
    const cardHtml = `
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">${pdfName}</h5>
            <a href="./assets/diet-list/${pdfName}" target="_blank" class="btn btn-primary">Open PDF</a>
          </div>
        </div>
      `;
    dietCardsContainer.innerHTML += cardHtml;
  });
}
