const express = require("express");
const Imap = require("imap");
const cors = require("cors");
const app = express();
const port = 3000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.static("public")); // Serve static files (HTML, CSS, JS)

const imapConfig = {
  user: "surya.nyros@gmail.com", // Replace with your email
  password: "qoyf kiiy aden qryj", // Use App Password if 2FA is enabled
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

// Function to connect to the IMAP server and fetch emails from a folder
const fetchEmailsFromFolder = (folderName, callback) => {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    // Open the folder (e.g., INBOX, [Gmail]/Spam)
    imap.openBox(folderName, false, (err, box) => {
      if (err) return callback(err, null);

      // Fetch the first 3 emails
      const fetch = imap.seq.fetch("1:3", {
        bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"],
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
              email.unread = header["seen"] === undefined; // If 'seen' header is missing, it's unread
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

// API route to fetch emails from a selected folder (INBOX, SPAM, etc.)
app.get("/fetch-emails/:folderName", (req, res) => {
  let folderName = req.params.folderName;

  // If the folder is 'SPAM', use the Gmail-specific spam folder
  if (folderName.toUpperCase() === "SPAM") {
    folderName = "[Gmail]/Spam"; // Gmail's spam folder name
  }

  fetchEmailsFromFolder(folderName, (err, emails) => {
    if (err) {
      console.error("Error fetching emails:", err);
      return res.status(500).json({ error: "Failed to fetch emails" });
    }
    res.json(emails); // Send emails as JSON to frontend
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
