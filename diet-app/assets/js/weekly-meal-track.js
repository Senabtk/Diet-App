var firebaseConfig = {
  apiKey: "AIzaSyBMH-CQq7RoFCOyBvJd8dgAZx6O_Ja5uqg",
  authDomain: "diet-37c76.firebaseapp.com",
  databaseURL: "https://diet-37c76-default-rtdb.firebaseio.com",
  projectId: "diet-37c76",
  storageBucket: "diet-37c76.appspot.com",
  messagingSenderId: "76874974979",
  appId: "1:76874974979:web:0c9616c630d9494e240b36",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
let user;
const loadingSpinner = document.getElementById("loadingSpinner");

window.addEventListener("load", function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  const user = firebase.auth().currentUser;
  if (user) {
    updateTableAndChart(user.uid);
  }
});

firebase.auth().onAuthStateChanged(function (authUser) {
  if (authUser) {
    user = authUser;
    updateTableAndChart(user.uid);
  }
});
const foodTrackForm = document.getElementById("foodTrackForm");
const foodTrackTableBody = document.getElementById("foodTrackTableBody");

foodTrackForm.addEventListener("submit", function (e) {
  e.preventDefault();

  showLoadingSpinner();

  const kahvalti = foodTrackForm.kahvalti.value.trim();
  const ogle = foodTrackForm.ogle.value.trim();
  const aksam = foodTrackForm.aksam.value.trim();
  const atistirma = foodTrackForm.atistirma.value.trim();
  const alinanKalori = parseFloat(foodTrackForm.alinanKalori.value);
  const verilenKalori = parseFloat(foodTrackForm.verilenKalori.value);

  if (
    kahvalti === "" ||
    ogle === "" ||
    aksam === "" ||
    atistirma === "" ||
    isNaN(alinanKalori) ||
    isNaN(verilenKalori)
  ) {
    alert("Lütfen tüm alanları doldurun ve geçerli sayıları girin.");
    showLoadingSpinner();
    return;
  }

  const currentDate = new Date();

  db.collection("food-track")
    .add({
      kahvalti,
      ogle,
      aksam,
      atistirma,
      alinanKalori,
      verilenKalori,
      tarih: currentDate,
      userUid: user.uid,
    })
    .then((docRef) => {
      console.log("Belge ID:", docRef.id);
      foodTrackForm.reset();

      clearTable();
      updateTableAndChart(user.uid);
      hideLoadingSpinner();
    })
    .catch((error) => {
      console.error("Hata:", error);
      hideLoadingSpinner();
    });
});
function updateTableAndChart(userUid) {
  showLoadingSpinner();

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

        const row = `
          <tr>
            <td>${data.kahvalti}</td>
            <td>${data.ogle}</td>
            <td>${data.aksam}</td>
            <td>${data.atistirma}</td>
            <td>${data.alinanKalori}</td>
            <td>${data.verilenKalori}</td>
            <td>
    <button
      class="btn btn-primary"
      data-toggle="modal"
      data-target="#editModal"
      onclick="openEditModal('${doc.id}', '${data.kahvalti}', '${data.ogle}', '${data.aksam}', '${data.atistirma}', '${data.alinanKalori}', '${data.verilenKalori}')"
    >
      Güncelle
    </button>
  </td>
   <td>
    <button
      class="btn btn-danger"
      onclick="deleteData('${doc.id}')"
    >
      Sil
    </button>
  </td>
          </tr>
        `;
        foodTrackTableBody.insertAdjacentHTML("beforeend", row);
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

      hideLoadingSpinner();
    })
    .catch((error) => {
      console.error("Hata:", error);
      hideLoadingSpinner();
    });
}

function showLoadingSpinner() {
  loadingSpinner.style.display = "flex";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

function clearTable() {
  foodTrackTableBody.innerHTML = "";
}

function deleteData(docId) {
  if (confirm("Bu veriyi silmek istediğinizden emin misiniz?")) {
    db.collection("food-track")
      .doc(docId)
      .delete()
      .then(() => {
        console.log("Belge başarıyla silindi.");
        clearTable();
        updateTableAndChart(user.uid);
      })
      .catch((error) => {
        console.error("Hata:", error);
      });
  }
}

function openEditModal(
  docId,
  kahvalti,
  ogle,
  aksam,
  atistirma,
  alinanKalori,
  verilenKalori
) {
  const editModal = document.getElementById("editModal");
  const kahvaltiInput = document.getElementById("editKahvalti");
  const ogleInput = document.getElementById("editOgle");
  const aksamInput = document.getElementById("editAksam");
  const atistirmaInput = document.getElementById("editAtistirma");
  const alinanKaloriInput = document.getElementById("editAlinanKalori");
  const verilenKaloriInput = document.getElementById("editVerilenKalori");
  const updateButton = document.getElementById("updateButton");

  kahvaltiInput.value = kahvalti;
  ogleInput.value = ogle;
  aksamInput.value = aksam;
  atistirmaInput.value = atistirma;
  alinanKaloriInput.value = alinanKalori;
  verilenKaloriInput.value = verilenKalori;

  updateButton.onclick = () => {
    const updatedKahvalti = kahvaltiInput.value.trim();
    const updatedOgle = ogleInput.value.trim();
    const updatedAksam = aksamInput.value.trim();
    const updatedAtistirma = atistirmaInput.value.trim();
    const updatedAlinanKalori = parseFloat(alinanKaloriInput.value);
    const updatedVerilenKalori = parseFloat(verilenKaloriInput.value);

    if (
      updatedKahvalti === "" ||
      updatedOgle === "" ||
      updatedAksam === "" ||
      updatedAtistirma === "" ||
      isNaN(updatedAlinanKalori) ||
      isNaN(updatedVerilenKalori)
    ) {
      alert("Lütfen tüm alanları doldurun ve geçerli sayıları girin.");
      return;
    }

    db.collection("food-track")
      .doc(docId)
      .update({
        kahvalti: updatedKahvalti,
        ogle: updatedOgle,
        aksam: updatedAksam,
        atistirma: updatedAtistirma,
        alinanKalori: updatedAlinanKalori,
        verilenKalori: updatedVerilenKalori,
      })
      .then(() => {
        console.log("Belge başarıyla güncellendi.");
        editModal.style.display = "none";
        $("#editModal").modal("hide");
        $(".modal-backdrop").remove();
        clearTable();
        updateTableAndChart(user.uid);
      })
      .catch((error) => {
        console.error("Hata:", error);
        $("#editModal").modal("hide");
        $(".modal-backdrop").remove();
      });
  };

  $("#editModal").modal("show");

  editModal.style.display = "block";
}
