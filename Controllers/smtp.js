const nodemailer = require("nodemailer");

// If you're using Amazon Pinpoint in a region other than US West (Oregon),
// replace email-smtp.us-west-2.amazonaws.com with the Amazon Pinpoint SMTP
// endpoint in the appropriate AWS Region.
const smtpEndpoint = process.env.SMTP_ENDPOINT;
// The port to use when connecting to the SMTP server.
const port = process.env.SMTP_PORT;
const mail = (to,subject, body) => {
  // Replace sender@example.com with your "From" address.
  // This address must be verified with Amazon Pinpoint.
  const senderAddress = process.env.SMTP_USERNAME;

  // Replace recipient@example.com with a "To" address. If your account
  // is still in the sandbox, this address must be verified. To specify
  // multiple addresses, separate each address with a comma.
  var toAddresses = to;
  if(Array.isArray(to))
   toAddresses = to.join(",");


 

  // CC and BCC addresses. If your account is in the sandbox, these
  // addresses have to be verified. To specify multiple addresses, separate
  // each address with a comma.
  var ccAddresses = toAddresses;
  var bccAddresses = toAddresses;

  // Replace smtp_username with your Amazon Pinpoint SMTP user name.
  const smtpUsername = process.env.SMTP_USERNAME;

  // Replace smtp_password with your Amazon Pinpoint SMTP password.
  const smtpPassword = process.env.SMTP_PASSWORD;

  // (Optional) the name of a configuration set to use for this message.
  var configurationSet = "ConfigSet";

  // The subject line of the email
  var subject = subject;

  // The email body for recipients with non-HTML email clients.
  var body_text = body;

  // The body of the email for recipients whose email clients support HTML content.
  var body_html = `<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Liberal Hub-Mailer</title>
</head>
<style>
    body {
        padding: 0px;
        margin: 0px;
        background-color: #d1d3d4
    }

    img {
        max-width: 100%;
        display: block;
    }

    table {
        border-collapse: collapse;
        border: none;
        font-family: Helvetica, Arial, sans-serif;
    }

    p {
        line-height: 1.2;
    }
</style>
<body>
  <h1>${subject}</h1>
    ${body}
</body>
</html>`;

  // The message tags that you want to apply to the email.
  var tag0 = "key0=value0";
  var tag1 = "key1=value1";

  async function main() {
    // Create the SMTP transport.
    let transporter = nodemailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: true, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Specify the fields in the email.
    let mailOptions = {
      from: senderAddress,
      to: toAddresses,
      subject: subject,
      cc: ccAddresses,
      bcc: bccAddresses,
      text: body_text,
      html: body_html,
      // Custom headers for configuration set and message tags.
      headers: {
        //   "X-SES-CONFIGURATION-SET": configurationSet,
        "X-SES-MESSAGE-TAGS": tag0,
        "X-SES-MESSAGE-TAGS": tag1,
      },
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent! Message ID: ", info.messageId);
  }

  main().catch(console.error);
};
module.exports = { mail};
