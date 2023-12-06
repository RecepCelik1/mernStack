//=> yetki kontrolü için middlewarelar

const User = require('../models/user.js')
const jwt = require('jsonwebtoken')



const authenticationMid = async (req, res, next) => {

  const {token} = req.cookies; //=> tokenin alınması

  if(!token){ //=> token kontrolü eğer token yoksa giriş yapmalı
    return res.status(500).json({message : "erişim için giriş yapınız"})
  }

  const decodedData = jwt.verify(token, "SECRETTOKEN") //=> tokenin doğrulanması
  
  if(!decodedData){ //=> erişim tokeninin geçerliliğinin kontrolü
    return res.status(500).json({message : "erişim tokeniniz geçersizdir"})
  }

  req.user = await User.findById(decodedData.id) //=> kullanıcı bilgilerinin alınması

  next();

}



const roleChecked = (...roles) => { //=> yetki kontrolü yapan fonkisyon

    return (req, res, next) => { //=> middleware döndürülmesi

        if(!roles.includes(req.User.role)){ //=> yetki kontrolü
            return res.status(500).json({message: "Bu işlem için yetkiniz bulunmamaktadır !!!"})
        }
        next(); //=> middleware sonlandırılması
    }
} 

module.exports = {authenticationMid, roleChecked}
