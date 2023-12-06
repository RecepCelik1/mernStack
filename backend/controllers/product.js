//burası ürünlerle ilgili işlemlerin yapıldığı component, ürün ekleme-çıkarma fln, filtreleme databaseden ürünleri çekme gibi

const Product = require('../models/product.js');
const ProductFilter = require('../utils/productFilter.js');
const cloudinary = require('cloudinary').v2



const allProducts = async(req, res) => { //=> burada bütün ürünleri çekip filtreleme fonksiyonunu import ettiğimiz kısım
    
    const resultPerPage = 10;
    const productFilter = new ProductFilter(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await productFilter.query;

    res.status(200).json({
        products
    })
}



//requires admin
const adminProducts = async (req, res, next) => { //=> burası admin productsları çektiğimiz kısım find fonksiyonu ile
    const products = await Product.find();

    res.status(200).json({
        products
    })
}



const detailProducts = async(req, res) => { //=> burası ürünlerin _id numaralarına göre detaylarını çektiğimiz kısım sorunsuzca çalışıyor
    const product = await Product.findById(req.params.id);

    res.status(200).json({
        product
    })
}



//requires admin
const createProduct = async(req, res, next) => { //=> ürün oluşturma kısmı
    let images = []
    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    let allImage = []; //bu döngü sayesinde eğer kullanıcı birden fazla resim eklemek isterse hepsini teker teker pushlayacağız
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: "products"
        })
        

        allImage.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = allImage
    req.body.user = req.user.id

    const product = await Product.create(req.body);

    res.status(201).json({
        product
    })
}



//requires admin
const deleteProduct = async(req, res, next) => { //=> ürün silme kısmı
    const product = await Product.findById(req.params.id);

    for (let i = 0; i < product.images.length; i++) {   //=> bu döngüde de sileceğimiz ürünün resimlerini teker teker sildik
        await cloudinary.uploader.destroy(product.images[i].public_id)
    }
    
    await product.remove();

    res.status(201).json({
        message: "ürün başarıyla yok edilmiştir tebrikler"
    })
}



//requires admin
const updateProduct = async(req, res, next) => { //=> databasedeki ürünleri düzenlediğimiz kısım
    const product = await Product.findById(req.params.id);

    let images = []
    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }


    if(images !== undefined){ //=> eğer kullanıcı resimleri güncellemek isterse burası eski resimleri teker teker delet edecektir
        for (let i = 0; i < product.images.length; i++) {   
            await cloudinary.uploader.destroy(product.images[i].public_id)
        }
    }

    let allImage = []; 
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: "products"
        })  

        allImage.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = allImage
    
     product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}) //findByIdAndUpdate kullanıyoruz

    res.status(201).json({
        product
    })
}



const createReview = async (req, res, next) => { //=> next adında yeni bir parametre tanımladık ve requires admin gerektiren tüm durumlarda kullandık. ürüne yorum ekleme kısmı

    const {productId, comment, rating} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        comment,
        rating: Number(rating)
    }

    const product = await Product.findById(productId);

    product.reviews.push(review)

    let avg = 0;
    product.reviews.forEach(rev => {    //=> ort rating bulma algoritması
        avg += rev.rating
    })  
    product.rating = avg / product.reviews.length;

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        message: "yorumunuz şahane şekilde eklenmiştir"
    })
}




module.exports = {allProducts, detailProducts, createProduct, deleteProduct, updateProduct, createReview, adminProducts}