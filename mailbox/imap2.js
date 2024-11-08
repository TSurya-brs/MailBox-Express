const express = require("express");
const Imap = require("imap");
const cors = require("cors");
const app = express();
const port = 3000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.static("public")); // Serve the static files (HTML, CSS, JS)

// IMAP connection settings
const imapConfig = {
  user: "your-email@example.com", // Your IMAP email
  password: "your-password", // Your IMAP password
  host: "imap.example.com", // Your IMAP host (e.g., 'imap.gmail.com')
  port: 993, // IMAP port
  tls: true, // Use TLS encryption
};

// Function to connect to the IMAP server and fetch emails
const fetchEmailsFromFolder = (folderName, callback) => {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    // Open the folder (e.g., INBOX, SPAM)
    imap.openBox(folderName, true, (err, box) => {
      if (err) return callback(err, null);

      // Fetch the first 10 emails
      const fetch = imap.seq.fetch("1:10", {
        bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"], // Fetch headers and body
        struct: true,
      });

      let emails = [];

      fetch.on("message", (msg, seqno) => {
        let email = {};
        msg.on("body", (stream, info) => {
          let buffer = "";
          stream.on("data", (chunk) => {
            buffer += chunk.toString("utf8");
          });

          stream.once("end", () => {
            if (info.which === "TEXT") {
              email.body = buffer;
            } else {
              const header = Imap.parseHeader(buffer);
              email.from = header.from;
              email.subject = header.subject;
              email.date = header.date;
            }
          });
        });

        msg.once("end", () => {
          emails.push(email);
        });
      });

      fetch.once("end", () => {
        imap.end();
        callback(null, emails); // Return emails
      });
    });
  });

  imap.once("error", (err) => {
    callback(err, null); // Return any errors
  });

  imap.connect();
};

// API route to fetch emails from a selected folder
app.get("/fetch-emails/:folderName", (req, res) => {
  const folderName = req.params.folderName;

  fetchEmailsFromFolder(folderName, (err, emails) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch emails" });
    } else {
      res.json(emails); // Send emails as JSON to frontend
    }
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
