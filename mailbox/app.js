const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const port = 9000;
const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//nodemail
app.post("/send", async (req, res) => {
  const { receipent_mail, subject, content } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receipent_mail,
    subject: subject,
    text: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error while sending mail", error);
    res.status(500).send("Error while sending mail");
  }
});

app.listen(port, () => {
  console.log(`server connected to ${port}`);
});
