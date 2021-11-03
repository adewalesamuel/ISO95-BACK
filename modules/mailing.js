/**
 * Mailing module
 * Author: samueladewale
*/
const { smtp, appName } = require('./../environement')
const nodemailer = require("nodemailer")
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: true, // true for 465, false for other ports
  auth: smtp.auth
});

const sendForgotPasswordMail = async (user, token, lang='fr') => {
  let info 

  if (lang.includes('fr')) {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: user.email, // list of receivers
      subject: "Renouvellez votre mot de passe", // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <h2 style='margin-bottom: 70px'>Salut ${user.username}</h2>
      <p style='font-size:16px; color: grey'>CLIQUER sur le lien ci-dessous pour renouveller votre mot de passe. <span style="color: grey">(Expire dans une heure)</span></p>
      <p><a style='font-weight: bolder' href='https://iso95.com/new-password/${token}'>https://iso95.com/new-password/${token}</a></p>
      </div>`// html body
    });
  }else {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: user.email, // list of receivers
      subject: "Renew your password", // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <h2 style='margin-bottom: 70px'>Hi ${user.username}!</h2>
      <p style='font-size:16px; color: grey'>CLICK the link below to set a new password. <span style="color: grey">(Expires in one hour)</span></p>
      <p><a style='font-weight: bolder' href='https://iso95.com/new-password/${token}'>https://iso95.com/new-password/${token}</a></p>
      </div>`// html body
    });
  }

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

const sendLikedPostMail = async (user, userTo, post, lang='fr') => {
  let info

  if (lang.includes('fr')) {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} a aimé votre photo`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/post/${post.publicId}'>https://iso95.com/post/${post.publicId}</a></p>
      </div>`// html body
    });
  }else {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} liked your picture`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/post/${post.publicId}'>https://iso95.com/post/${post.publicId}</a></p>
      </div>`// html body
    });
  }
  
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

const sendPostCommentMail = async (user, userTo, post, lang='fr') => {
  let info

  if (lang.includes('fr')) {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} a commenté votre photo`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/post/${post.publicId}'>https://iso95.com/post/${post.publicId}</a></p>
      </div>`// html body
    });
  }else {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} had a comment to your picture`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/post/${post.publicId}'>https://iso95.com/post/${post.publicId}</a></p>
      </div>`// html body
    });
  }

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

const sendFollowerMail = async (user, userTo, lang='fr') => {
  let info

  if (lang.includes('fr')) {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} a commencé à vous suivre`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/user/${user.username}'>https://iso95.com/user/${user.username}</a></p>
      </div>`// html body
    });
  }else {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} started following you`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/user/${user.username}'>https://iso95.com/user/${user.username}</a></p>
      </div>`// html body
    });
  }
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

const sendMessageMail = async (user, userTo, lang='fr') => {
  let info

  if (lang.includes('fr')) {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} vous a envoyé un message`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/user/${user.username}'>https://iso95.com/user/${user.username}</a></p>
      </div>`// html body
    });
  }else {
    // send mail with defined transport object
    info = await transporter.sendMail({
      from: `"${appName}" <${smtp.auth.user}>`, // sender address
      to: userTo.email, // list of receivers
      subject: `${user.username} sent you a message`, // Subject line
      html:`<div style='font-family: sans-serif; margin:auto; max-width: 600px; word-wrap: break-word'>
      <p><a style='font-weight: bolder' href='https://iso95.com/user/${user.username}'>https://iso95.com/user/${user.username}</a></p>
      </div>`// html body
    });
  }
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = {
  sendForgotPasswordMail,
  sendLikedPostMail,
  sendPostCommentMail,
  sendFollowerMail,
  sendMessageMail
}
