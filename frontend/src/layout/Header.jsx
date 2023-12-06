//=> burası header bölümü için

import React, { useState } from "react";
import { SlBasket } from "react-icons/sl";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getKeyword } from "../redux/generalSlice";


const Header = () => {
    const [openMenu, setOpenMenu] = useState(false);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const menuItems = [
        {
            name: "Profil",
            url: "/profile",
        },
        {
            name: "Admin",
            url: "/admin",
        },
        {
            name: "Çıkış Yap",
            url: "/logout",
        },
    ];

    const keywordFunc = () => { //=> kullanıcı tarafından girilen anahtar kelimenin tutulması ve store.js e dispatch edilmesi
        console.log(keyword);
        dispatch(getKeyword(keyword));
        setKeyword('');
        navigate('/products');
    };

    return (
        <div className='bg-gray-300 h-16 px-2 flex items-center justify-between'>


            <div className='text-4xl'>
                MERN Stack Project
            </div>


            <div className='flex items-center gap-5'>


                <div className="flex items-center">

                    {/* aramanın yapıldığı kısım ve onchance ile setKeyword tetiklenip girilen parametre keyword içerisinde tutulur */}
                    <input value={keyword} onChange={e => setKeyword(e.target.value)} className="p-2 outline-none" type="text" 
                    placeholder="Arama yap"/>
                    {/* onClik ile keywordFunc tetiklenir ve backendden o keyword ile filtreleme istediğinde bulunulur */}
                    <div onClick={keywordFunc} className="p-2 ml-1 cursor-pointer"><IoIosSearch size={30}/></div>
                
                </div>


                <div className='relative'>

                {/* kullanıcı avatarı ve menüleri gömülmüştür onClick edildiğinde setOpenMenu fonksiyonu tetiklenir ve menü maplanir */}
                    <img onClick={()=> setOpenMenu(!openMenu)} className="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg" alt="" />
                    {openMenu && <div className='absolute right-0 mt-3 w-[200px] bg-white shadow-lg shadow-gray-300'>
                        {menuItems.map((item, i) => (
                            <div className="px-2 py-1 hover:bg-gray-200 " key={i} onClick={() => navigate(item.url)}>{item.name}</div>
                        ))}
                    </div>}

                </div>


                <div className='relative'>
                    {/* sepet kısmı */}
                    <SlBasket size={30}/>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">4</div>
                
                </div>
            
            
            </div>
        
        
        </div>
    );
};

export default Header;
