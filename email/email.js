import nodemailer from "nodemailer";
export const sendemail=(email,name)=>{
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'Project9.check@gmail.com', 
        pass: 'cdzkeusmfobauxhr'
      },
      });
  
      transporter.sendMail({
        from: 'Project9.check@gmail.com',
        to: email,
        replyTo:'Project9.check@gmail.com',
        subject: 'Form submission response',
        text: 'Your form is submitted successfully',
        }).then(function(data) {
            console.log(data);
            return (data)
          }, function(error) {
            console.error(error);
            return false;
          });
    
  }