// import React, { useState } from 'react'
// import OTPInput from "../../components/authentication/OTPInput"
// import {OTPlessSignin} from "../../config/otpless"

// function Index() {

//     const [currentStep, setCurrentStep] = useState(0);
//     const [phone, setPhone] = useState("");
//     const [otp, setOtp] = useState("");

//     const phoneAuth = () => {
//         OTPlessSignin.initiate({
//           channel: "PHONE",
//           phone: "839899038845",
//           countryCode: "+62",
//         });
//       };

//       const verifyOTP = () => {
//         OTPlessSignin.verify({
//           channel: "PHONE",
//           phone: "98785XXXXX",
//           otp: "123456",
//           countryCode: "+91",
//         });
//         };

//     const handleSubmit = (pin) => {
//         // handle api request here but I'm console logging it
//         console.log(pin)
//     }

//   return (
//     <div>
        
//         {/* <!-- component --> */}
// {/* <!-- component --> */}
// <div className="bg-sky-100 flex justify-center items-center h-screen">
//     {/* <!-- Left: Image --> */}
// <div className="w-1/2 h-screen hidden lg:block">
//   <img src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826" alt="Placeholder Image" className="object-cover w-full h-full"/>
// </div>
// {/* <!-- Right: Login Form --> */}
// <div className= "lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
//   <h1 className="text-2xl font-semibold mb-4 text-black ">Login/Signup</h1>
//   <form action="#" method="POST">
//     {/* <!-- Username Input --> */}
//     <div className="mb-4 bg-sky-100">
//       <label htmlFor="username" className="block text-gray-600">Phone Number</label>
//       <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off"
//       value={phone} onChange={(e)=>{e.preventDefault(); setPhone(e.target.value)}}
//       />
//     </div>
//     {/* <!-- Password Input --> */}
//     <div className="mb-4">
//       <label htmlFor="password" className="block text-gray-800">OTP</label>
//       <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off"/>
//       {/* <OTPInput length={5} onComplete={handleSubmit} /> */}
//     </div>
    
//     {/* <!-- Login Button --> */}
//     <button type="submit" className="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">Login</button>
//   </form>
//   {/* <!-- Sign up  Link --> */}
//   <div className="mt-6 text-green-500 text-center">
//     <a href="#" className="hover:underline">Sign up Here</a>
//   </div>
// </div>
// </div>

//     </div>
//   )
// }

// export default Index

import React from 'react'

function Index() {
  return (
    <div>I</div>
  )
}

export default Index