// Function to fetch emails from the specified folder
function fetchEmails(folderName) {
  // Fetch emails from the backend
  fetch(`http://localhost:3000/fetch-emails/${folderName}`)
    .then((response) => response.json())
    .then((emails) => {
      // Display the emails
      displayEmails(emails);
    })
    .catch((error) => {
      console.error("Error fetching emails:", error);
    });
}

// Function to display emails in the frontend
function displayEmails(emails) {
  const emailContainer = document.getElementById("emails");
  emailContainer.innerHTML = ""; // Clear previous emails

  if (emails.length === 0) {
    emailContainer.innerHTML = "<p>No emails found.</p>";
    return;
  }

  emails.forEach((email) => {
    const emailElement = document.createElement("div");
    emailElement.classList.add("email");

    // If the email is unread, make it bold
    if (email.unread) {
      emailElement.classList.add("bold");
    }

    emailElement.innerHTML = `
      <span><strong>From:</strong> ${email.from}</span>
      <span><strong>Subject:</strong> ${email.subject}</span>
      <span><strong>Date:</strong> ${email.date}</span>
      <span><strong>Body:</strong> ${email.body}</span>
    `;

    emailContainer.appendChild(emailElement);
  });
}
