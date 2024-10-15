import React, { useState } from 'react'
import {validateEmail} from "../../MyFunctions"
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';

const formImageUrl = "https://images.unsplash.com/photo-1481026469463-66327c86e544?q=80&w=2708&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

// let token = localStorage.getItem("token");
//     let decryptedToken = Jwt.decode(token, process.env.JWT_SECRET);
//     console.log(decryptedToken)

function Login({changeLoginStatus}) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async(e) =>{
    e.preventDefault();

    if(validateEmail(email)){
      if(password.length !== 0){
        if(password.length >= 6){
          try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admins/login?email=${email}&password=${password}`);
            
            if (response.data.success) {
              console.log("Signup successful, token:", response.data.token);
              localStorage.setItem("iProp-token", response.data.token)
              toast.success("Logged In successfully! Welcome.")
              changeLoginStatus();
              setTimeout(() => {
                  navigate("/");
              }, 1500);

            } else {
              console.log('Signup failed:', response.data.message);
            }
          } catch (error) {
            if (error.response) {
              // If validation errors or server error
              console.error('Error:', error.response.data);
            } else {
              console.error('Unexpected error:', error.message);
            }
          }
        }else{
          toast.error("Password must be atleast 6 characters long.")
        }
      }else{
        toast.error("Enter password.")
      }
    }else{
      toast.error("Enter valid email.")
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
  <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg sm:flex">
    <div className="m-2 w-full rounded-2xl bg-gray-400 bg-cover bg-center text-white sm:w-2/5" style={{backgroundImage: `url(${formImageUrl})`}}></div>
    <div className="w-full sm:w-3/5">
      <div className="p-8">
        <h1 className="text-3xl font-black text-slate-700">Login</h1>
        <p className="mt-2 mb-5 text-base leading-tight text-gray-600">Login to your <span className='font-bold'>iProp91</span> account to continue.</p>
        <form className="mt-8">
          <div className="relative mt-2 w-full">
            <input type="text" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0" placeholder=" " />
            <label htmlFor="email" className="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600"> Enter Your Email </label>
          </div>
          <div className="relative mt-2 w-full">
            <input type="password" id="password" className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0" placeholder=" " value={password} onChange={(e)=>setPassword(e.target.value)} />
            <label htmlFor="password" className="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600"> Enter Your Password</label>
          </div>
          <input className="mt-4 w-full cursor-pointer rounded-lg bg-blue-600 pt-3 pb-3 text-white shadow-lg hover:bg-blue-400" type="submit" onClick={handleLogin} />
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">{`Don't have an account already? `}<a href="/signup" className="font-bold text-blue-600 no-underline hover:text-blue-400">Sign Up</a></p>
        </div>
      </div>
    </div>
  </div>
  <ToastContainer position="top-right" autoClose={2000} />
</div>
  )
}

export default Login;