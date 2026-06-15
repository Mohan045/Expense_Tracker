// This holds the ID of the fruit being edited
// null means we are adding a new fruit
var editId = null;

// ── When page loads, show all fruits ──────────────────────────────
window.onload = function() {
  loadFruits();
};

// ── Load all fruits from the server ───────────────────────────────
function loadFruits() {
  fetch("/fruits")
  .then(function(response) {
    return response.json();
  })
  .then(function(fruits) {
    showFruits(fruits);
  });
}

// ── Show fruits in the table ───────────────────────────────────────
function showFruits(fruits) {
  var tbody = document.getElementById("fruit-table");
  var rows  = "";

  for (var i = 0; i < fruits.length; i++) {
    var f = fruits[i];
    rows = rows +
      "<tr>" +
        "<td>" + f.id       + "</td>" +
        "<td>" + f.name     + "</td>" +
        "<td>" + f.price    + "</td>" +
        "<td>" + f.quantity + "</td>" +
        "<td><button onclick='editFruit(" + f.id + ")'>Edit</button></td>" +
        "<td><button onclick='deleteFruit(" + f.id + ")'>Delete</button></td>" +
      "</tr>";
  }

  tbody.innerHTML = rows;
}

// ── Save button — Add or Edit depending on editId ─────────────────
function saveFruit() {
  var name     = document.getElementById("name").value;
  var price    = document.getElementById("price").value;
  var quantity = document.getElementById("quantity").value;

  // Check fields are not empty
  if (name === "" || price === "" || quantity === "") {
    document.getElementById("message").innerText = "Please fill all fields.";
    return;
  }

  var fruitData = {
    name:     name,
    price:    Number(price),
    quantity: Number(quantity)
  };

  // If editId is null → ADD. If editId has a number → EDIT
  if (editId === null) {

    // ── ADD: send POST request to server ────────────────
    fetch("/fruits", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(fruitData)
    })
    .then(function(response) {
      return response.json();
    })
    .then(function() {
      document.getElementById("message").innerText = "Fruit added!";
      clearForm();
      loadFruits();
    });

  } else {

    // ── EDIT: send PUT request to server ─────────────────
    fetch("/fruits/" + editId, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(fruitData)
    })
    .then(function(response) {
      return response.json();
    })
    .then(function() {
      document.getElementById("message").innerText = "Fruit updated!";
      cancelEdit();
      loadFruits();
    });

  }
}

// ── Edit button clicked — fill the form with fruit details ────────
function editFruit(id) {
  // Fetch the latest fruits and find the one to edit
  fetch("/fruits")
  .then(function(response) {
    return response.json();
  })
  .then(function(fruits) {
    for (var i = 0; i < fruits.length; i++) {
      if (fruits[i].id === id) {
        // Fill the form
        document.getElementById("name").value     = fruits[i].name;
        document.getElementById("price").value    = fruits[i].price;
        document.getElementById("quantity").value = fruits[i].quantity;
      }
    }
  });

  // Remember which fruit we are editing
  editId = id;

  // Change the heading and show Cancel button
  document.getElementById("form-heading").innerText        = "Edit Fruit";
  document.getElementById("cancel-btn").style.display      = "inline";
  document.getElementById("message").innerText             = "";
}

// ── Cancel edit — go back to Add mode ─────────────────────────────
function cancelEdit() {
  editId = null;
  clearForm();
  document.getElementById("form-heading").innerText   = "Add Fruit";
  document.getElementById("cancel-btn").style.display = "none";
  document.getElementById("message").innerText        = "";
}

// ── Delete button clicked — remove the fruit ──────────────────────
function deleteFruit(id) {
  var confirmed = confirm("Delete this fruit?");

  if (confirmed) {
    fetch("/fruits/" + id, {
      method: "DELETE"
    })
    .then(function(response) {
      return response.json();
    })
    .then(function() {
      document.getElementById("message").innerText = "Fruit deleted!";
      loadFruits();
    });
  }
}

// ── Clear the form inputs ──────────────────────────────────────────
function clearForm() {
  document.getElementById("name").value     = "";
  document.getElementById("price").value    = "";
  document.getElementById("quantity").value = "";
}
