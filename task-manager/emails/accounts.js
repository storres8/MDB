const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "storres8@binghamton.edu",
    subject: "Thanks for joining",
    text: `Welcome to the the app ${name}!! Let us know how you're liking it so far! `
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "storres8@binghamton.edu",
    subject: "We're sorry to see you leave.",
    text: `We're sorry to see you leave ${name}! Let us know if there was anything we could of done to keep you around!`
  });
};

module.exports = {
  // sendWelcomeEmail:sendWelcomeEmail
  // Using the ES6 shorthand syntax
  sendWelcomeEmail,
  sendCancelEmail
};
