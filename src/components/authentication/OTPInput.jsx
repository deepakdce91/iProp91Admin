import React, { useRef, useState } from 'react';


const OTPInput = ({ length = 4, onComplete} ) => {
  // if you're not using Typescript, simply do const inputRef = useRef()


  const inputRef = useRef();


  // if you're not using Typescript, do useState()
  const [OTP, setOTP] = useState();


  const handleTextChange = (input, index) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);


    // check if the user has entered the first digit, if yes, automatically focus on the next input field and so on.


    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }


    if (input.length === 0 && index > 0) {
      inputRef.current[index - 1]?.focus();
    }


    // if the user has entered all the digits, grab the digits and set as an argument to the onComplete function.


    if (newPin.every((digit) => digit !== '')) {
      onComplete(newPin.join(''));
    }
  };


  // return the inputs component


  return (
    <div className={`grid grid-cols-4 gap-5`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleTextChange(e.target.value, index)}
          ref={(ref) => (inputRef.current[index] = ref)}
          className={`border border-solid border-border-slate-500 focus:border-blue-600 p-5 outline-none`}
          style={{ marginRight: index === length - 1 ? '0' : '10px' }}
        />
      ))}
    </div>
  );
};


export default OTPInput;