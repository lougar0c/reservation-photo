require("dotenv").config();

const express = require("express"); 
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express(); // ✅ DÉCLARÉ AVANT

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // pour servir index.html

// Page principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS
  }
});

let reservations = [];

// ✅ ROUTE POST (CORRECTE)
app.post("/reserve", async (req, res) => {
  const { nom, date, heure, email, tel, cosplay } = req.body;

  const dejaPris = reservations.find(r => r.date === date && r.heure === heure);

  if (dejaPris) {
    return res.send("❌ Créneau déjà réservé");
  }

  reservations.push({ nom, date, heure, email });
    // 📧 Email CLIENT
  await transporter.sendMail({
    from: "lougaroc.pro@gmail.com",
    to: email,
    subject: "Confirmation de rendez-vous 📸",
    text: `Bonjour ${nom},

Votre rendez-vous est confirmé pour le:

📅 Date : ${date}
🕒 Heure : ${heure}

Merci et à bientôt !`
  });

  // 📧 EMAIL ADMIN (TOI)
  await transporter.sendMail({
    from: "lougaroc.pro@gmail.com",
    to: "lougaroc.pro@gmail.com", // 👈 TON EMAIL
    subject: "📅 Nouvelle réservation",
    text: `Nouvelle réservation :

👤 Nom : ${nom}
📧 Email : ${email}
📞 Téléphone : ${tel}
🎭 Cosplay : ${cosplay}
📅 Date : ${date}
🕒 Heure : ${heure}`
  });

  res.send("✅ Réservation confirmée + email envoyé");
});

// Voir les réservations
app.get("/reservations", (req, res) => {
  res.json(reservations);
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});