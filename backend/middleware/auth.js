const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

const authenticationMid = async (req, res, next) => {
  const {token} = req.cookies;

  if(!token){
    return res.status(500).json({message : "erişim için giriş yapınız"})
  }

  const decodedData = jwt.verify(token, "SECRETTOKEN")
  if(!decodedData){
    return res.status(500).json({message : "erişim tokeniniz geçersizdir"})
  }

  req.user = await User.findById(decodedData.id)

  next();

}

const roleChecked = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.User.role)){
            return res.status(500).json({message: "Bu işlem için yetkiniz bulunmamaktadır !!!"})
        }
        next();
    }
} 

module.exports = {authenticationMid, roleChecked}
