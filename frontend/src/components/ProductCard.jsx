//=> ürünlerin detay kısmına yönlendirilme aşaması

import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick"

const ProductCard = ({product}) => {

    const navigate = useNavigate(); //=> useNavigate hooku

    const settings = { //=> slider konfigürasyonu
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
      };


    return(
        <div onClick={() => navigate(`/product/${product?._id}`)} className='w-[250px] bg-gray-100'>  
             <Slider {...settings}> {/* settingsler içeri aktarılır ve divdeki onclick ile interaktif hale getirilir*/}

            {   //=> bu kısım ile ürünler maplenir ve navigate ile detay sayfasına aktarılır
                product?.images?.map((image, i) => ( 
                    <img key={i} src={image.url} alt="" />
                ))
            }

             </Slider>
           <div className="text-xl px-3">{product?.name}</div> {/* ürün isimleri ve fiyatları gösterilir */}
           <div className="text-2xl px-3">{product?.price}</div>
        </div>
    )
}

export default ProductCard