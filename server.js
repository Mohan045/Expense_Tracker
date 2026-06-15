// Load the tools we need
const http = require("http");
const fs   = require("fs");

// ── Read fruits from the file ──────────────────────────────────────
function readFruits() {
  const text = fs.readFileSync("fruits.json", "utf8");
  return JSON.parse(text);
}

// ── Save fruits to the file ────────────────────────────────────────
function saveFruits(fruits) {
  fs.writeFileSync("fruits.json", JSON.stringify(fruits, null, 2));
}

// ── Create the server ──────────────────────────────────────────────
const server = http.createServer(function(req, res) {

  const method = req.method;
  const url    = req.url;

  // ── Serve the HTML page ──────────────────────────────────────────
  if (url === "/") {
    const page = fs.readFileSync("index.html", "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(page);
  }

  // ── Serve the JS file ────────────────────────────────────────────
  else if (url === "/script.js") {
    const file = fs.readFileSync("script.js", "utf8");
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(file);
  }

  // ── GET: Send all fruits to the browser ──────────────────────────
  else if (method === "GET" && url === "/fruits") {
    const fruits = readFruits();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(fruits));
  }

  // ── POST: Add a new fruit ─────────────────────────────────────────
  else if (method === "POST" && url === "/fruits") {
    let body = "";

    req.on("data", function(chunk) {
      body = body + chunk;
    });

    req.on("end", function() {
      const newFruit = JSON.parse(body);
      const fruits   = readFruits();

      // Give it a new ID
      newFruit.id = fruits.length + 1;

      // Add to list and save
      fruits.push(newFruit);
      saveFruits(fruits);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newFruit));
    });
  }

  // ── DELETE: Remove a fruit by ID ─────────────────────────────────
  else if (method === "DELETE" && url.startsWith("/fruits/")) {

    // Get the ID from the URL  e.g. /fruits/3  →  3
    const id     = parseInt(url.split("/")[2]);
    const fruits = readFruits();

    // Find and remove the fruit
    const newList = fruits.filter(function(f) {
      return f.id !== id;
    });

    saveFruits(newList);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Deleted" }));
  }

  // ── PUT: Edit a fruit by ID ───────────────────────────────────────
  else if (method === "PUT" && url.startsWith("/fruits/")) {
    const id   = parseInt(url.split("/")[2]);
    let   body = "";

    req.on("data", function(chunk) {
      body = body + chunk;
    });

    req.on("end", function() {
      const updated = JSON.parse(body);
      const fruits  = readFruits();

      // Find the fruit and update it
      for (let i = 0; i < fruits.length; i++) {
        if (fruits[i].id === id) {
          fruits[i].name     = updated.name;
          fruits[i].price    = updated.price;
          fruits[i].quantity = updated.quantity;
        }
      }

      saveFruits(fruits);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Updated" }));
    });
  }

});

// ── Start the server ───────────────────────────────────────────────
server.listen(3000, function() {
  console.log("Server is running at http://localhost:3000");
});
