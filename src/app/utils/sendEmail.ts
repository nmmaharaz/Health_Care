import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";
import httpStatus from "http-status-codes"
import ejs from "ejs"

const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: envVars.smtp.smtp_host,
  port: Number(envVars.smtp.smtp_port),
  secure: true, 
  auth: {
    user: envVars.smtp.smtp_user,
    pass: envVars.smtp.smtp_pass,
  },
});

// Send an email using async/await
interface ISendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData?: Record<string, any>;
    attachments?: {
        filname: string;
        content: Buffer | string;
        contentType: string
    }[] 
}

export const sendEmail = async({to, subject, templateName, templateData, attachments}:ISendEmailOptions)=>{
    try{
            const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
    const html = await ejs.renderFile(templatePath, templateData)
    const info = await transporter.sendMail({
        from: envVars.smtp.smtp_from,
        to,
        subject,
        html,
        attachments: attachments?.map(attachment=>({
            filename: attachment.filname,
            content: attachment.content,
            contentType: attachment.contentType
        }))
    })
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    }catch(err){
        console.log(err)
        throw new AppError(httpStatus.BAD_REQUEST, "Email error")
    }
}