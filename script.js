// ── Keep track of all contacts and edit state ──────────────────────
var allContacts  = [];   // stores all contacts loaded from server
var editingId    = null; // stores the ID of contact being edited (null = adding new)

// ── When page loads, fetch all contacts ────────────────────────────
window.onload = function() {
  loadContacts();
};

// ── READ: Load all contacts from server ────────────────────────────
function loadContacts() {
  fetch("/api/contacts")
    .then(function(res)  { return res.json(); })
    .then(function(data) {
      allContacts = data;
      showContacts(allContacts);
    })
    .catch(function() {
      document.getElementById("contacts-list").innerHTML =
        "<p class='loading'>⚠️ Cannot connect. Run: node server.js</p>";
    });
}

// ── Show contacts on the page ──────────────────────────────────────
function showContacts(contacts) {
  var list = document.getElementById("contacts-list");

  // If no contacts found
  if (contacts.length === 0) {
    list.innerHTML = "<p class='loading'>No contacts found.</p>";
    return;
  }

  // Build a card for each contact
  var html = "";
  for (var i = 0; i < contacts.length; i++) {
    var c          = contacts[i];
    var firstLetter = c.name.charAt(0).toUpperCase();

    html += "<div class='contact-card' id='card-" + c.id + "'>";
    html +=   "<div class='avatar avatar-" + c.category + "'>" + firstLetter + "</div>";
    html +=   "<div class='contact-info'>";
    html +=     "<div class='contact-name'>"  + c.name  + "</div>";
    html +=     "<div class='contact-phone'>📞 " + c.phone + "</div>";
    html +=     "<div class='contact-email'>✉️ " + c.email + "</div>";
    html +=   "</div>";
    html +=   "<span class='badge badge-" + c.category + "'>" + c.category + "</span>";
    html +=   "<div class='card-buttons'>";
    html +=     "<button class='btn-edit'   onclick='editContact(" + c.id + ")'>✏️ Edit</button>";
    html +=     "<button class='btn-delete' onclick='deleteContact(" + c.id + ")'>🗑 Delete</button>";
    html +=   "</div>";
    html += "</div>";
  }

  list.innerHTML = html;
}

// ── CREATE / UPDATE: Save button clicked ───────────────────────────
function saveContact() {
  // Get values from form
  var name     = document.getElementById("f-name").value.trim();
  var phone    = document.getElementById("f-phone").value.trim();
  var email    = document.getElementById("f-email").value.trim();
  var category = document.getElementById("f-category").value;
  var errorMsg = document.getElementById("error-msg");

  // Simple validation
  if (!name || !phone || !email || !category) {
    errorMsg.textContent   = "⚠️ Please fill in all fields.";
    errorMsg.style.display = "block";
    return;
  }
  errorMsg.style.display = "none";

  // Build the contact object to send
  var contactData = { name: name, phone: phone, email: email, category: category };

  // Decide: are we ADDING or EDITING?
  if (editingId === null) {
    // ── ADD: POST request ────────────────────────────────
    fetch("/api/contacts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(contactData)
    })
    .then(function(res)  { return res.json(); })
    .then(function(data) {
      showToast("✅ Contact added!");
      clearForm();
      loadContacts();
    });

  } else {
    // ── EDIT: PUT request ────────────────────────────────
    fetch("/api/contacts/" + editingId, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(contactData)
    })
    .then(function(res)  { return res.json(); })
    .then(function(data) {
      showToast("✅ Contact updated!");
      cancelEdit();
      loadContacts();
    });
  }
}

// ── UPDATE: Fill form with contact details for editing ─────────────
function editContact(id) {
  // Find the contact from our local list
  var contact = null;
  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].id === id) {
      contact = allContacts[i];
      break;
    }
  }

  if (!contact) return;

  // Fill the form with this contact's details
  document.getElementById("f-name").value     = contact.name;
  document.getElementById("f-phone").value    = contact.phone;
  document.getElementById("f-email").value    = contact.email;
  document.getElementById("f-category").value = contact.category;

  // Switch form to "edit mode"
  editingId = id;
  document.getElementById("form-title").textContent  = "✏️ Edit Contact";
  document.getElementById("btn-save").textContent    = "💾 Update Contact";
  document.getElementById("btn-cancel").style.display = "block";

  // Scroll to top so user sees the form
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Cancel editing — go back to Add mode ───────────────────────────
function cancelEdit() {
  editingId = null;
  clearForm();
  document.getElementById("form-title").textContent   = "➕ Add New Contact";
  document.getElementById("btn-save").textContent     = "💾 Save Contact";
  document.getElementById("btn-cancel").style.display = "none";
}

// ── DELETE: Remove a contact ───────────────────────────────────────
function deleteContact(id) {
  // Ask user to confirm first
  var confirmed = confirm("Are you sure you want to delete this contact?");
  if (!confirmed) return;

  fetch("/api/contacts/" + id, { method: "DELETE" })
    .then(function(res)  { return res.json(); })
    .then(function(data) {
      showToast("🗑️ Contact deleted.");
      loadContacts();
    });
}

// ── SEARCH: Filter contacts by name ───────────────────────────────
function searchContacts() {
  var query    = document.getElementById("search").value.toLowerCase();
  var filtered = [];

  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].name.toLowerCase().includes(query)) {
      filtered.push(allContacts[i]);
    }
  }

  showContacts(filtered);
}

// ── Helper: Clear the form fields ─────────────────────────────────
function clearForm() {
  document.getElementById("f-name").value      = "";
  document.getElementById("f-phone").value     = "";
  document.getElementById("f-email").value     = "";
  document.getElementById("f-category").value  = "";
  document.getElementById("error-msg").style.display = "none";
}

// ── Helper: Show a toast notification ─────────────────────────────
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function() {
    toast.classList.remove("show");
  }, 3000);
}
