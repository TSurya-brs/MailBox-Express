document.getElementById("submit-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const receipent_mail = document.getElementById("receipent_mail").value;
  const subject = document.getElementById("subject").value;
  const content = document.getElementById("content").value;

  if (receipent_mail === "" || subject === "") {
    alert("Enter mail and subject");
    return;
  }

  const data = {
    receipent_mail: receipent_mail,
    subject: subject,
    content: content,
  };

  try {
    const data_sending = await fetch("/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await data_sending.text();
    console.log("Data sent successfully to Backend &", result);

    document.getElementById("receipent_mail").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("content").value = "";
  } catch (error) {
    console.log("Data not sent successfully to Backend due to ", error);
  }
});
