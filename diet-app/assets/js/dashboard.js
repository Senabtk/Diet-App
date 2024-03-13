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
const loadingSpinner = document.getElementById("loadingSpinner");

const loseWeightSubmitForm = document.getElementById("loseWeightSubmitForm");
const gainWeightSubmitForm = document.getElementById("gainWeightSubmitForm");
let weightData = [];

document.addEventListener("DOMContentLoaded", function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      loadWaterData(user.uid);
      updateTableAndChart(user.uid);
      loadUserData(user.uid);
      db.collection("users")
        .doc(user.uid)
        .get()
        .then(function (doc) {
          if (doc.exists) {
            const goal = doc.data().dietGoal;
            const loseWeightForm = document.getElementById("loseWeightForm");
            const gainWeightForm = document.getElementById("gainWeightForm");
            if (goal === "gainWeight") {
              // Kilo alma hedefi ise kilo verme formunu gizle
              loseWeightForm.style.display = "none";
              gainWeightForm.style.display = "block";
            } else if (goal === "loseWeight") {
              // Kilo verme hedefi ise kilo alma formunu gizle
              gainWeightForm.style.display = "none";
              loseWeightForm.style.display = "block";
            }
          } else {
            console.log("No such document!");
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });

      db.collection("users")
        .doc(user.uid)
        .get()
        .then(function (doc) {
          if (doc.exists) {
            loseWeightSubmitForm.addEventListener("submit", function (event) {
              event.preventDefault();
              const verilenKilo = parseFloat(
                document.getElementById("verilenKilo").value
              );
              const userWeight = parseFloat(doc.data().weight);

              if (verilenKilo < userWeight) {
                updateUserWeight(user.uid, userWeight - verilenKilo);
                updateUserPoints(user.uid, 5, verilenKilo);

                // Verilen kilo değerini diziye ekleyin
                weightData.push({
                  date: new Date().toLocaleDateString(),
                  value: -verilenKilo, // Verilen kilo negatif olacaktır
                });

                // Çizgi grafiğini güncelle
                updateWeightChart();
              }

              loseWeightSubmitForm.reset();
            });

            gainWeightSubmitForm.addEventListener("submit", function (event) {
              event.preventDefault();

              const alinanKilo = parseFloat(
                document.getElementById("alinanKilo").value
              );
              const userWeight = parseFloat(doc.data().weight);

              if (alinanKilo > userWeight) {
                updateUserWeight(user.uid, userWeight + alinanKilo);
                updateUserPoints(user.uid, 5, verilenKilo);

                // Alınan kilo değerini diziye ekleyin
                weightData.push({
                  date: new Date().toLocaleDateString(),
                  value: alinanKilo,
                });

                // Çizgi grafiğini güncelle
                updateWeightChart();
              }

              gainWeightSubmitForm.reset();
            });
          }
        });
    } else {
      console.log("User is not logged in.");
    }
  });
});

function updateUserPoints(userId, pointsToAdd, weight) {
  const tarih = new Date().toLocaleDateString();
  db.collection("users")
    .doc(userId)
    .update({
      points: firebase.firestore.FieldValue.increment(pointsToAdd),
      weightData: firebase.firestore.FieldValue.arrayUnion({
        weight: weight,
        date: tarih,
      }),
    })
    .then(function () {
      console.log("Puanlar güncellendi.");
    })
    .catch(function (error) {
      console.error("Hata:", error);
    });
}

function updateUserWeight(userId, newWeight) {
  db.collection("users")
    .doc(userId)
    .update({
      weight: newWeight,
    })
    .then(function () {
      console.log("Kullanıcının kilosu güncellendi.");
    })
    .catch(function (error) {
      console.error("Kilo güncelleme hatası:", error);
    });
}

function addWeightChangeToFirestore(userId, kiloMiktarı) {
  const tarih = new Date().toLocaleDateString();

  db.collection("kilo-degisim")
    .add({
      userId: userId,
      tarih: tarih,
      kilo: kiloMiktarı,
    })
    .then(function (docRef) {
      console.log("Kilo değişimi Firestore'a eklendi:", docRef.id);
    })
    .catch(function (error) {
      console.error("Kilo değişimi eklenirken hata oluştu:", error);
    });
}

function fetchWeightChangesFromFirestore(userId) {
  db.collection("users")
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const weightChanges = doc.data().weightData || [];
        weightData = weightChanges;
        updateWeightChart();
      }
    })
    .catch((error) => {
      console.error("Kilo değişikliği verilerini çekerken hata oluştu:", error);
    });
}

function updateWeightChart() {
  var ctx = document.getElementById("weightChart").getContext("2d");

  if (window.weightChart && typeof window.weightChart.destroy === "function") {
    window.weightChart.destroy();
  }

  window.weightChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: weightData.map((data) => data.date),
      datasets: [
        {
          label: "Kilo Değişimi (kg)",
          data: weightData.map((data) => data.value),
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

function loadWaterData() {
  let userId = firebase.auth().currentUser.uid;
  db.collection("water-track")
    .doc(userId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        let chartData = [];
        let waterAmounts = doc.data()["water-amount"];
        waterAmounts.forEach(function (data, index) {
          chartData.push({
            x: `${data.date} (${data.day})`,
            y: parseFloat(data.amount),
          });
        });
        updateChart(chartData);

        if (loadingSpinner) {
          loadingSpinner.style.display = "none";
        } else {
          if (loadingSpinner) {
            loadingSpinner.style.display = "none";
          }
          showAlert("Kullanıcı verisi bulunamadı.", "error");
        }
      } else {
        console.log("No such document!");
        loadingSpinner.style.display = "none";
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
      loadingSpinner.style.display = "none";
    });
}

function updateChart(chartData) {
  var ctx = document.getElementById("waterChart").getContext("2d");

  if (window.waterChart && typeof window.waterChart.destroy === "function") {
    window.waterChart.destroy();
  }

  window.waterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.map((data) => data.x),
      datasets: [
        {
          label: "Su Tüketimi (ml)",
          data: chartData.map((data) => data.y),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateTableAndChart(userUid) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7);

  db.collection("food-track")
    .where("userUid", "==", userUid)
    .where("tarih", ">=", oneWeekAgo)
    .orderBy("tarih")
    .get()
    .then((querySnapshot) => {
      let alinanKaloriToplami = 0;
      let verilenKaloriToplami = 0;
      const labels = [];
      const kaloriData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alinanKaloriToplami += data.alinanKalori;
        verilenKaloriToplami += data.verilenKalori;

        const tarih = data.tarih.toDate();
        labels.push(`${tarih.getDate()}/${tarih.getMonth() + 1}`);
        kaloriData.push(alinanKaloriToplami - verilenKaloriToplami);
      });

      var ctx = document.getElementById("kaloriChart").getContext("2d");
      var kaloriChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Günlük Kalori Değişimi",
              data: kaloriData,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Hata:", error);
    });
}

// ***********************

function loadUserData(userId) {
  fetchWeightChangesFromFirestore(userId);
}
