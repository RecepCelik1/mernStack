import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../redux/productSlice';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const dispatch = useDispatch();
    const {products, loading} = useSelector(state => state.products)

    useEffect(() => {
        dispatch(getProducts({keyword: "", rating: "", price: {min: 0, max: 30000}}))
        console.log("dispatch çalıştı")
    }, [dispatch])

       
    return(
        <>
        <div>
            <img src="https://cdn.dsmcdn.com/mrktng/seo/tyindirimgunleristatik/banner.png" alt="" />
        </div>
            {
                loading ? "Loading..." : <div>
                    {
                        products?.products && <div className='flex items-center justify-center gap-5 my-5 flex-wrap'>
                        {
                            products?.products?.map((products,i) => (
                                <ProductCard product={products} key={i}/>
                            ))
                        }
                    </div>
                    }
                </div>
            }
        </>
    )
}

export default Home