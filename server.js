// ── Step 1: Load the tools we need ────────────────────────────────
const http = require("http");
const fs   = require("fs");
const path = require("path");

// ── Step 2: Basic settings ─────────────────────────────────────────
const PORT      = 3000;
const DATA_FILE = path.join(__dirname, "contacts.json");

// ── Step 3: Helper — Read contacts from file ───────────────────────
function readContacts() {
  const text = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(text);
}

// ── Step 4: Helper — Save contacts to file ─────────────────────────
function saveContacts(contacts) {
  const text = JSON.stringify(contacts, null, 2);
  fs.writeFileSync(DATA_FILE, text);
}

// ── Step 5: Helper — Send a JSON response ─────────────────────────
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ── Step 6: Helper — Send a File (HTML, CSS, JS) ──────────────────
function sendFile(res, filePath) {
  // Check what type of file it is
  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "application/javascript"
  };

  // Read the file and send it
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[ext] });
    res.end(data);
  });
}

// ── Step 7: Helper — Read request body (for POST and PUT) ─────────
function readBody(req, callback) {
  let body = "";
  req.on("data", function(chunk) {
    body += chunk;
  });
  req.on("end", function() {
    const data = JSON.parse(body);
    callback(data);
  });
}

// ── Step 8: Create the server ──────────────────────────────────────
const server = http.createServer(function(req, res) {

  const method = req.method;       // GET, POST, PUT, DELETE
  const url    = req.url;          // e.g. "/api/contacts" or "/api/contacts/1"

  // Allow browser to talk to server
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browser pre-check request — just say OK
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Route: Home page ────────────────────────────────────────────
  if (method === "GET" && url === "/") {
    sendFile(res, path.join(__dirname, "index.html"));
    return;
  }

  // ── Route: CSS file ─────────────────────────────────────────────
  if (method === "GET" && url === "/style.css") {
    sendFile(res, path.join(__dirname, "style.css"));
    return;
  }

  // ── Route: JS file ──────────────────────────────────────────────
  if (method === "GET" && url === "/script.js") {
    sendFile(res, path.join(__dirname, "script.js"));
    return;
  }

  // ── Route: GET all contacts ──────────────────────────────────────
  // URL: /api/contacts
  if (method === "GET" && url === "/api/contacts") {
    const contacts = readContacts();
    sendJSON(res, 200, contacts);
    return;
  }

  // ── Route: POST — Add a new contact ─────────────────────────────
  // URL: /api/contacts
  if (method === "POST" && url === "/api/contacts") {
    readBody(req, function(data) {
      const contacts = readContacts();

      // Create a new contact with a unique ID
      const newContact = {
        id:       contacts.length > 0 ? contacts[contacts.length - 1].id + 1 : 1,
        name:     data.name,
        phone:    data.phone,
        email:    data.email,
        category: data.category
      };

      // Add to list and save
      contacts.push(newContact);
      saveContacts(contacts);

      sendJSON(res, 201, newContact);
    });
    return;
  }

  // ── Route: PUT — Edit a contact ──────────────────────────────────
  // URL: /api/contacts/1  (the number is the ID)
  const editMatch = url.match(/^\/api\/contacts\/(\d+)$/);
  if (method === "PUT" && editMatch) {
    const id = parseInt(editMatch[1]);

    readBody(req, function(data) {
      const contacts = readContacts();

      // Find the contact by ID
      const index = contacts.findIndex(function(c) { return c.id === id; });

      if (index === -1) {
        sendJSON(res, 404, { error: "Contact not found" });
        return;
      }

      // Update the contact details
      contacts[index].name     = data.name;
      contacts[index].phone    = data.phone;
      contacts[index].email    = data.email;
      contacts[index].category = data.category;

      saveContacts(contacts);
      sendJSON(res, 200, contacts[index]);
    });
    return;
  }

  // ── Route: DELETE — Remove a contact ────────────────────────────
  // URL: /api/contacts/1  (the number is the ID)
  const deleteMatch = url.match(/^\/api\/contacts\/(\d+)$/);
  if (method === "DELETE" && deleteMatch) {
    const id       = parseInt(deleteMatch[1]);
    const contacts = readContacts();

    // Find the contact by ID
    const index = contacts.findIndex(function(c) { return c.id === id; });

    if (index === -1) {
      sendJSON(res, 404, { error: "Contact not found" });
      return;
    }

    // Remove the contact
    const deleted = contacts.splice(index, 1)[0];
    saveContacts(contacts);

    sendJSON(res, 200, { message: "Contact deleted", contact: deleted });
    return;
  }

  // ── Fallback: Route not found ────────────────────────────────────
  res.writeHead(404);
  res.end("Page not found");

});

// ── Step 9: Start the server ───────────────────────────────────────
server.listen(PORT, function() {
  console.log("──────────────────────────────────");
  console.log("  ✅  Contact Book App is Running ");
  console.log("  🌐  http://localhost:" + PORT     );
  console.log("──────────────────────────────────");
});
