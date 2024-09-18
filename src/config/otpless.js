
//   const callback = (userinfo) => {
//     const emailMap = otplessUser.identities.find(
//       (item) => item.identityType === "EMAIL"
//     );

//     const mobileMap = otplessUser.identities.find(
//       (item) => item.identityType === "MOBILE"
//     )?.identityValue;

//     const token = otplessUser.token;

//     const email = emailMap?.identityValue;

//     const mobile = mobileMap?.identityValue;

//     const name = emailMap?.name || mobileMap?.name;

//     console.log(userinfo);

//     // Implement your custom logic here.
//   };
//   // Initialize OTPLESS SDK with the defined callback.
//  export const OTPlessSignin = new OTPless(callback);
 
