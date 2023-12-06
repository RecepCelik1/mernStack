const User = require('../models/user.js')
const bcrypt = require('bcryptjs')
const jwt = require('bcryptjs')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const register = async (req,res) => {
  
  const avatar = await cloudinary.uploader.upload(req.body.avatar, {
     folder : "avatars",
     width: 130,
     crop: "scale"
  })
  
  const {name, email, password,} = req.body;
  
  const user = await User.findOne({email})
  if(user){
    return res.status(500).json({message : "bu mail zaten kullanılıyor bi akıllı sen misin :D"})
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if(password.length < 6){
    return res.status(500).json({message : "şifre 6 karakterden kısa olamaz hacklenir fln sonra bize ağlama"})
  }

  const newUser = await User.create({
    name, 
    email, 
    password: passwordHash,
    avatar: {
        public_id: avatar.public_id,
        url: avatar.secure_url
    }
})

  //=> gayet güzel ve düzenli bir token oluşturduk
  const token = await jwt.sign({id: newUser._id}, "SECRETTOKEN", {expiresIn: "1h"})

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24*60*60*1000) //=> 5 * 24*60*60*1000 kısmında 5 yazan yeri kendinize göre revize edebilirsiniz
  }

  res.status(201).cookie("token", token, cookieOptions).json({
    newUser,
    token
  })

}
const login = async (req,res) => {
    const {email, password} = req.body;

    const user = await User.findOne(email);

    if(!user){
        return res.status(500).json({message: "e-posta veya şifre hatalı ama hangisi söylemem"})
    }

    const comparePassword = await bcrypt.compare(password, user.password)
    if(!comparePassword){
        return res.status(500).json({message: "e-posta veya şifre hatalı ama hangisi söylemem"})
    }

    const token = await jwt.sign({id: user._id}, "SECRETTOKEN", {expiresIn: "1h"})

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24*60*60*1000) 
  }

  res.status(200).cookie("token", token, cookieOptions).json({
    user,
    token
  })

}

const logout = async (req,res) => {

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now()) 
    }

    res.status(200).cookie("token", null, cookieOptions).json({
        message: "çıkış yapılmıştır"
    })
}
const forgotPassword = async (req,res) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return res.status(500).json({message: "bu e-postaya kayıtlı bir hesap bulunamadı"})
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpire = Date.now() + 5*60*1000 //=> resetToken geçerlilik süresi

    await user.save({validateBeforeSave: false});

    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}`

    const message = `Şifreni sıfırlamak için kullanacağınız token : ${passwordUrl}`

    try {
        const transporter = nodemailer.createTransport({
            port: 465, 
            service: "gmail",              
            host: "smtp.gmail.com",
               auth: {
                    user: 'youremail@gmail.com', //=> kullanıcılara e-postayı atıcak olan mailin kullanıcı adı ve şifresi
                    pass: 'password',
                 },
            secure: true,
            });


            const mailData = {
                from: 'youremail@gmail.com',  // sender address //=> yukarıda yazdığın kendi mailini buraya vermen gerekiyor
                  to: req.body.email,   // list of receivers
                  subject: 'Şifre Sıfırlama',
                  text: message,
                };
            await transporter.sendMail(mailData)
            
            res.status(200).json({message: "Mailinizi kontrol ediniz"})
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})

        res.status(500).json({message: error.message})
    }
}
const resetPassword = async (req,res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken ,
    resetPasswordExpire: {$gt : Date.now()}
  })

  if(!user) {
    return res.status(500).json({message: "geçersiz token !!!"})
  }

  user.password = req.body.password;
  user.resetPasswordExpire = undefined
  user.resetPasswordToken = undefined

  await user.save();

  const token = jwt.sign({id: user._id}, "SECRETTOKEN", {expiresIn: "1h"});

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24*60*60*1000) 
  }

  res.status(200).cookie("token", token, cookieOptions).json({
    user,
    token
  })

}

const userDetail = async (req, res, next) => {
  const user = await User.findById(req.params.id)
  res.status(200).json({
    user,
  })
} 

module.exports = {register, login, logout, forgotPassword, resetPassword, userDetail}