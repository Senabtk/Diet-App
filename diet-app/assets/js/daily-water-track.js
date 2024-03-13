var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};

let loadingSpinner = document.getElementById("loadingSpinner");

document.addEventListener("DOMContentLoaded", function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      loadWaterData();
    } else {
      console.log("User is not logged in.");
    }
  });
});

var db = firebase.firestore();

function addWaterIntake() {
  let waterAmount = document.getElementById("waterInput").value;
  if (!waterAmount) {
    alert("Please enter a water amount");
    return;
  }

  let currentDate = new Date();
  let dateString = currentDate.toISOString().slice(0, 10);

  let dayOfWeek = currentDate.toLocaleString("tr-TR", { weekday: "long" });

  let userId = firebase.auth().currentUser.uid;
  let waterIntakeRef = db.collection("water-track").doc(userId);

  waterIntakeRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        waterIntakeRef.update({
          "water-amount": firebase.firestore.FieldValue.arrayUnion({
            date: dateString,
            day: dayOfWeek,
            amount: waterAmount,
          }),
        });
      } else {
        waterIntakeRef.set({
          "water-amount": [
            {
              date: dateString,
              day: dayOfWeek,
              amount: waterAmount,
            },
          ],
        });
      }
    })
    .then(function () {
      console.log("Document successfully written!");
      loadWaterData();
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

function loadWaterData() {
  let userId = firebase.auth().currentUser.uid;
  db.collection("water-track")
    .doc(userId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        let tableBody = document.getElementById("waterTableBody");
        tableBody.innerHTML = "";
        let chartData = [];
        let waterAmounts = doc.data()["water-amount"];
        waterAmounts.forEach(function (data, index) {
          let row = `<tr>
                        <td>${data.date} (${data.day})</td>
                        <td>${data.amount}</td>
                        <td>
                          <button class="btn btn-primary btn-sm" onclick="showUpdateModal('${index}', '${data.date}', '${data.amount}')">Güncelle</button>
                          <button class="btn btn-danger btn-sm" onclick="deleteIntake('${index}')">Sil</button>
                        </td>
                      </tr>`;
          tableBody.innerHTML += row;
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

function showUpdateModal(index, date, amount) {
  document.getElementById("updateDate").value = date;
  document.getElementById("updateAmount").value = amount;
  $("#updateModal").modal("show");
}

function updateWaterIntake() {
  let index = document.getElementById("updateModal").getAttribute("data-index");
  let newDate = new Date(document.getElementById("updateDate").value);
  let newDateString = newDate.toISOString().slice(0, 10);
  let newDayOfWeek = newDate.toLocaleString("tr-TR", { weekday: "long" });
  let newAmount = document.getElementById("updateAmount").value;
  let userId = firebase.auth().currentUser.uid;

  db.collection("water-track")
    .doc(userId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        let waterAmounts = doc.data()["water-amount"];
        waterAmounts[index] = {
          date: newDateString,
          day: newDayOfWeek,
          amount: newAmount,
        };

        return db.collection("water-track").doc(userId).update({
          "water-amount": waterAmounts,
        });
      } else {
        console.log("No such document!");
        loadingSpinner.style.display = "none";
      }
    })
    .then(function () {
      console.log("Document successfully updated!");
      loadWaterData();
      loadingSpinner.style.display = "none";
    })
    .catch(function (error) {
      console.error("Error updating document: ", error);
      loadingSpinner.style.display = "none";
    });

  $("#updateModal").modal("hide");
}

function deleteIntake(index) {
  let userId = firebase.auth().currentUser.uid;

  db.collection("water-track")
    .doc(userId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        let waterAmounts = doc.data()["water-amount"];
        waterAmounts.splice(index, 1);

        return db.collection("water-track").doc(userId).update({
          "water-amount": waterAmounts,
        });
      } else {
        console.log("No such document!");
        loadingSpinner.style.display = "none";
      }
    })
    .then(function () {
      console.log("Document successfully updated!");
      loadWaterData();
      loadingSpinner.style.display = "none";
    })
    .catch(function (error) {
      console.error("Error updating document: ", error);
      loadingSpinner.style.display = "none";
    });
}
