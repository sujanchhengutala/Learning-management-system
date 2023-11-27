import nodemailer, { Transport, Transporter } from "nodemailer"
import ejs, { render } from "ejs"
import path from "path"

interface EmailOption{
    email:string;
    subject:string;
    template:string;
    data:{[key:string]:any}

}
//Nodemailer configuration
const sendMail = async(option:EmailOption):Promise<void>=>{
   
  let transporter:Transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: parseInt(process.env.SMPT_PORT || "587"),
    service:process.env.SMPT_SERVICE,
    auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD
    },
  });

  const {email, subject, template, data} = option
  //get the path of the email template file
  const emailTemplate = path.join(__dirname, "../mails", template)

  //render the email template with ejs
  const html:string = await ejs.renderFile(emailTemplate, data)

  const mailOption = {
    from:process.env.SMPT_email,
    to:email,
    subject,
    html,
    
}
await transporter.sendMail(mailOption)
}

export default sendMail

