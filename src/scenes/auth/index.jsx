import React, { useState, useEffect } from "react";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Authenticate, initOTPless, verifyOTP } from "../../config/initOTPless";
import axios from "axios";

function Index() {
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [otp, setOtp] = useState("");

  const [phone, setPhone] = useState(null);
  const [otp, setOtp] = useState(null);
  const [token, setToken] = useState("");

  const [currentStage, setCurrentStage] = useState(1);

  const verifyToken = async (e) => {
    e.preventDefault();

    if (token !== "") {
      const clientId = process.env.REACT_APP_OTPLESS_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_OTPLESS_CLIENT_SECRET;

     
      const reqObj = {
        token,
        client_id: clientId,       // Replace with your client ID
        client_secret: clientSecret
      }

      console.log(reqObj);
        await axios.post('https://auth.otpless.app/auth/userInfo', reqObj, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((response)=>{
            console.log(response.data);
          })
          .catch((error)=>{
            console.log(error.message);
          })
          
        
        
     
    }
  };

  useEffect(() => initOTPless(callback), []);

  const callback = (otplessUser) => {
    console.log(otplessUser);
  };

  return (
    <div className=" h-full w-full  overflow-hidden px-2 flex flex-col items-center justify-center">
      {/* <!-- Login --> */}
      {/* <div className="relative flex w-96 flex-col space-y-5 rounded-lg border bg-white px-5 py-10 shadow-xl sm:mx-auto">
        <div className="-z-10 absolute top-4 left-1/2 h-full w-5/6 -translate-x-1/2 rounded-lg bg-blue-600 sm:-right-10 sm:top-auto sm:left-auto sm:w-full sm:translate-x-0"></div>
        <div className="mx-auto mb-2 space-y-3">
          {!(currentStage === 3) && (
            <h1 className="text-center text-3xl font-bold text-gray-700">
              Login/Signup
            </h1>
          )}

          {currentStage === 3 && (
            <div className="transform scale-0 transition-transform duration-500 ease-out animate-scale-up">
              <div className="flex items-center justify-center">
                <BiSolidBadgeCheck className="text-green-500 h-32 w-32" />
              </div>
              <div className="text-center text-2xl font-bold text-gray-700">
                Authentication Successful!
              </div>
            </div>
          )}

          {!(currentStage === 3) && (
            <p className="text-lg text-gray-700">Authenticate to continue </p>
          )}
        </div>

        {currentStage === 1 && (
          <div className="transform scale-0 transition-transform duration-500 ease-out animate-scale-up">
            <div className="relative mt-2 w-full">
              <input
                type="text"
                id="mobile-input"
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                }}
                value={phoneNumber}
                className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="origin-[0] peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 absolute left-1 top-2 z-10 -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300"
              >
                {" "}
                Enter Your Phone number{" "}
              </label>
            </div>
          </div>
        )}

        {currentStage === 2 && (
          <div className="transform scale-0 transition-transform duration-500 ease-out animate-scale-up">
            <div className="relative mt-2 w-full">
              <input
                type="text"
                id="otp-input"
                minLength={6} maxLength={6}
                className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=" "
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
              />
              <label
                htmlFor="password"
                className="origin-[0] peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 absolute left-1 top-2 z-10 -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300"
              >
                {" "}
                Enter the OTP
              </label>
            </div>
          </div>
        )}

        <div className="flex w-full items-center">
          <button
            className="shrink-0 inline-block w-full rounded-lg bg-blue-600 py-3 font-bold text-white"
            onClick={handleButtonClick}
          >
            {currentStage === 1
              ? "Send OTP"
              : currentStage === 2
              ? "Verify OTP"
              : currentStage === 3
              ? "Continue"
              : "Login button"}
          </button>
          
        </div>
        <p className="text-center text-gray-600 font-semibold">
          iProp Technologies
        </p>
      </div>  */}
      {/* <!-- /Login --> */}

      <div id="mobile-section" className="my-4">
        <input
          className="text-black"
          id="mobile-input"
          placeholder="Enter mobile number"
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={(e) => {
          e.preventDefault();
          Authenticate({ channel: "PHONE", phone })
        }}>
          Request OTP
        </button>
      </div>

      <div id="otp-section" className="my-4">
        <input
          id="otp-input"
          className="text-black"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
          minLength={6}
          maxLength={6}
        />
        <button onClick={() => {
          try {
            verifyOTP({ channel: "PHONE", otp, phone })
          } catch (error) {
            console.log("Error occured at otp verification.")
          }
        }}>
          Verify OTP
        </button>
      </div>

      <div className="my-4">
        <input
          value={token}
          className="text-black"
          placeholder="Enter token"
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={verifyToken}>Verify token</button>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Index;
