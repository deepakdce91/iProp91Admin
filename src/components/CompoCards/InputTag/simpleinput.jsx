import React from "react";

const SimpleInput = ({ placeholder, type, setValue, value  }) => {

    const handleChange = (e) => {
        setValue(e.target.value); 
    };

    return (
        <>
            <div className={`w-full m-2 font-sm`}>
                <input
                    type={type}
                    className="bg-white border border-yellow-600 text-gray-900 text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-blue-500 rounded-full font-sm"
                    placeholder={placeholder}
                    value={value} // Set the input value from the state
                    onChange={handleChange} // Call handleChange when the input changes
                    required
                />
            </div>
        </>
    );
};

export default SimpleInput;
