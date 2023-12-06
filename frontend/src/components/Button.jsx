import React from "react";

const Button = ({name, onClick}) => {
    return (
        <button className="w-[200px] h-10 flex items-center justify-center name-lg bg-green-600 text-white rounded-md" onClick={onClick}>{name}</button>
    )
}

export default Button