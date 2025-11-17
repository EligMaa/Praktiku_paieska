const nodemailer = require('nodemailer');

// Email transporter konfigūracija
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Funkcija siųsti email apie aplikacijos statusą
async function sendApplicationStatusEmail(studentEmail, studentName, internshipTitle, status, companyName) {
  let subject, text, html;

  if (status === 'patvirtinta') {
    subject = ` Jūsų praktikos paraiška priimta - ${internshipTitle}`;
    text = `Sveiki, ${studentName}!\n\nDžiugu pranešti, kad jūsų paraiška praktikai "${internshipTitle}" įmonėje "${companyName}" buvo priimta!\n\nNetrukus su jumis susisieks praktikos vadovas dėl tolimesnių detalių.\n\nSėkmės!`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;"> Jūsų praktikos paraiška priimta!</h2>
        <p>Sveiki, <strong>${studentName}</strong>!</p>
        <p>Džiugu pranešti, kad jūsų paraiška praktikai <strong>"${internshipTitle}"</strong> įmonėje <strong>"${companyName}"</strong> buvo <strong>priimta</strong>!</p>
        <p>Netrukus su jumis susisieks praktikos vadovas dėl tolimesnių detalių.</p>
        <p style="margin-top: 30px; color: #666;">Sėkmės!</p>
      </div>
    `;
  } else if (status === 'atmesta') {
    subject = `Atnaujinimas dėl praktikos paraiškos - ${internshipTitle}`;
    text = `Sveiki, ${studentName}!\n\nDėkojame už susidomėjimą praktika "${internshipTitle}" įmonėje "${companyName}".\n\nDeja, šiuo metu negalime priimti jūsų paraiškos.\n\nKviečiame tęsti paieškas ir aplikuoti į kitas praktikas mūsų platformoje.\n\nSėkmės!`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #666;">Atnaujinimas dėl praktikos paraiškos</h2>
        <p>Sveiki, <strong>${studentName}</strong>!</p>
        <p>Dėkojame už susidomėjimą praktika <strong>"${internshipTitle}"</strong> įmonėje <strong>"${companyName}"</strong>.</p>
        <p>Deja, šiuo metu negalime priimti jūsų paraiškos.</p>
        <p>Kviečiame tęsti paieškas ir aplikuoti į kitas praktikas mūsų platformoje.</p>
        <p style="margin-top: 30px; color: #666;">Sėkmės!</p>
      </div>
    `;
  } else {
    return; // Nesiųsti email jei statusas 'laukia'
  }

  const mailOptions = {
    from: `"InternLink" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${studentEmail} for status: ${status}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendApplicationStatusEmail };
