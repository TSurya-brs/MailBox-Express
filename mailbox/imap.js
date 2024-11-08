// 1. Function: handleFolderClick
const handleFolderClick = (folderName) => {
  console.log(`Fetching emails from ${folderName}...`);

  // 1.1. Open connection to IMAP server
  imap.connect(); // Connect to IMAP server

  // 1.2. Fetch emails from the folder
  fetchEmailsFromFolder(folderName, imap, (err, emails) => {
    if (err) {
      console.error("Error fetching emails:", err);
      return;
    }

    // 1.3. Display emails
    displayEmails(emails); // Display the emails in the console or UI
  });
};

// 2. Function: fetchEmailsFromFolder
const fetchEmailsFromFolder = (folderName, imap, callback) => {
  // 2.1. Open the folder (INBOX, SPAM, etc.)
  openFolder(folderName, imap, (err, box) => {
    if (err) return callback(err, null);

    // 2.2. Fetch emails from the selected folder
    fetchEmails(imap, "1:10", (err, emails) => {
      if (err) return callback(err, null);

      // 2.3. Return the emails once fetched
      callback(null, emails);
    });
  });
};

// 3. Function: openFolder
const openFolder = (folderName, imap, callback) => {
  // 3.1. Open the folder in read-only mode (we don't need to modify emails)
  imap.openBox(folderName, true, callback); // 'true' means read-only
};

// 4. Function: fetchEmails
const fetchEmails = (imap, range, callback) => {
  const fetch = imap.seq.fetch(range, {
    bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"], // Fetch headers and body
    struct: true,
  });

  let emails = []; // To store the emails

  // 4.1. Process each email message
  fetch.on("message", (msg, seqno) => {
    processEmail(msg, emails); // Process each email message
  });

  // 4.2. When all emails are fetched, return them
  fetch.once("end", () => {
    callback(null, emails); // Send emails back via callback
  });
};

// 5. Function: processEmail
const processEmail = (msg, emails) => {
  let email = {}; // Object to store the email's details

  msg.on("body", (stream, info) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString("utf8"); // Collect email body content
    });

    stream.once("end", () => {
      if (info.which === "TEXT") {
        email.body = buffer; // Store the email body
      } else {
        parseHeader(buffer, email); // Parse email header
      }
    });
  });

  msg.once("end", () => {
    emails.push(email); // Add the email to the list
  });
};

// 6. Function: parseHeader
const parseHeader = (buffer, email) => {
  const header = Imap.parseHeader(buffer); // Parse the header buffer
  email.from = header.from; // Set the 'from' field
  email.subject = header.subject; // Set the 'subject' field
  email.date = header.date; // Set the 'date' field
};

// 7. Function: displayEmails
const displayEmails = (emails) => {
  emails.forEach((email, index) => {
    console.log(`Email ${index + 1}:`);
    console.log(`From: ${email.from}`);
    console.log(`Subject: ${email.subject}`);
    console.log(`Date: ${email.date}`);
    console.log(`Body: ${email.body}\n`);
  });
};
