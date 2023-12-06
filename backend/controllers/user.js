//kullanıcı işlemlerinin yapıldığı component

const User = require('../models/user.js')
const bcrypt = require('bcryptjs')
const jwt = require('bcryptjs')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')
const nodemailer = require('nodemailer')



const register = async (req,res) => { //=> burası register aşaması düzenlemek gerekiyor multistep olması için
  
  const avatar = await cloudinary.uploader.upload(req.body.avatar, { // avatar alma kısmı
     folder : "avatars",
     width: 130,
     crop: "scale"
  })
  
  const {name, email, password,} = req.body; //isim, mail ve şifre almak için değikenler oluşturduk
  
  const user = await User.findOne({email}) // girilen maili databasedekiler ile kıyaslama aşaması
  if(user){
    return res.status(500).json({message : "bu mail zaten kullanılıyor bi akıllı sen misin :D"})
  }

  const passwordHash = await bcrypt.hash(password, 10); 

  if(password.length < 6){ //şifre girilme aşaması
    return res.status(500).json({message : "şifre 6 karakterden kısa olamaz hacklenir fln sonra bize ağlama"})
  }

  const newUser = await User.create({ //girilen dataların bir obje içerisinde toparlanması ve database pushlanması
    name, 
    email, 
    password: passwordHash,
    avatar: {
        public_id: avatar.public_id,
        url: avatar.secure_url
    }
})

  //=> gayet güzel ve düzenli bir token oluşturduk ve cookilere ekledik
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



const login = async (req,res) => { //=> burası login işlemlerinin yapıldığı yer şifre ve password databasede kayıtlı datalar ile compare edilir
    const {email, password} = req.body;

    const user = await User.findOne(email); //=> frontendden req olarak gelen e posta databasede aranır 

    if(!user){ //=> eğer e posta uyuşursa kod devam eder 
        return res.status(500).json({message: "e-posta veya şifre hatalı ama hangisi söylemem"})
    }

    const comparePassword = await bcrypt.compare(password, user.password) //=> aynı şekilde şifre girilme ve kıyaslama şeysi

    if(!comparePassword){
        return res.status(500).json({message: "e-posta veya şifre hatalı ama hangisi söylemem"})
    }

    const token = await jwt.sign({id: user._id}, "SECRETTOKEN", {expiresIn: "1h"}) //=>başarılı şekilde giriş yapma

  const cookieOptions = { //=> cookie oluşturma ve oturumu açık bırakma kısmı
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24*60*60*1000) 
  }

  res.status(200).cookie("token", token, cookieOptions).json({
    user,
    token
  })

}



const logout = async (req,res) => { //=> logout kısmı

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now()) 
    }

    res.status(200).cookie("token", null, cookieOptions).json({ //çıkış yapılır ve null değeri atanarak çerez silinir
        message: "çıkış yapılmıştır"
    })
}



const forgotPassword = async (req,res) => { //=> burası unutulmuş şifreyi sıfırlamak için oluşturduğumuz fonksiyon nodemailer kullandım

    const user = await User.findOne({email: req.body.email}) //=> burada mail üzerinden kullanıcı ._id si bulunur

    if(!user){ //=> bulunamazsa hata mesajı
        return res.status(500).json({message: "bu e-postaya kayıtlı bir hesap bulunamadı"})
    }

    const resetToken = crypto.randomBytes(20).toString('hex'); //=> sıfırlama tokeni oluşturuldu

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex') //=> token hashlenip databaseye pushlanır
    user.resetPasswordExpire = Date.now() + 5*60*1000 //=> resetToken geçerlilik süresi

    await user.save({validateBeforeSave: false});

    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}` //=> sıfırlama urli oluşturulur

    const message = `Şifreni sıfırlamak için kullanacağınız token : ${passwordUrl}`

    try {
        const transporter = nodemailer.createTransport({ //=> mail gönderme kısmı
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
            
            res.status(200).json({message: "Mailinizi kontrol ediniz"}) //=> mail gönderme başarılı
    } catch (error) {
      //=> hata durumunda resetToken sıfırlanır
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})

        res.status(500).json({message: error.message})
    }
}



const resetPassword = async (req,res) => { //=> şifre sıfırlama aşaması 
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex') //=> geçerli token hashlenir

  const user = await User.findOne({ //=> kullanıcının bulunması
    resetPasswordToken ,
    resetPasswordExpire: {$gt : Date.now()}
  })

  if(!user) { //=> hatalı giriş kısmı
    return res.status(500).json({message: "geçersiz token !!!"})
  }

  //=> yeni şifrenin oluşturulması ve databaseye pushlanması
  user.password = req.body.password; 
  user.resetPasswordExpire = undefined
  user.resetPasswordToken = undefined

  await user.save();

  //=> JWT oluşturulması ve cookie haline getirilmesi
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



const userDetail = async (req, res, next) => { //=> user detail
  const user = await User.findById(req.params.id)
  res.status(200).json({
    user,
  })

  
} 

module.exports = {register, login, logout, forgotPassword, resetPassword, userDetail}