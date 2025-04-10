var OTPlessSignin = null
/**
 * Creates a script element to load the OTPless SDK.
 *
 * @return {void} No return value
 */
const loadScript = () => {
	const script = document.createElement('script')
	script.id = 'otpless-sdk'
	script.type = 'text/javascript'
	script.src = 'https://otpless.com/v2/headless.js'
	// Get your app id from https://otpless.com/dashboard/customer/dev-settings
	script.setAttribute('data-appid', process.env.REACT_APP_OTPLESS_APP_ID)
	// TODO: Add your app id				
	document.head.appendChild(script)
}


/**
 * Initializes the OTPless SDK and sets up a callback function.
 *
 * @param {function} callback - The callback function to be executed after successful authentication.
 * @return {void} No return value.
 */
export const initOTPless = (callback) => {
	// Loading the script if it's not already loaded
	if (!document.getElementById('otpless-sdk')) loadScript()

	// Initializing the OTPless SDK after 1 second to allow the script to load.
	setTimeout(() => {
		OTPlessSignin = new window.OTPless(callback)
	}, 1000)
}

/**
 * Authenticates the user using any authentication method available.
 * Email / Phone, OTP / Magic Link / Social Authentications
 * @param {Object} params - The parameters for primary authentication.
 * for social authentication use 'channel': 'OAUTH' and 'channelType' (eg. 'GOOGLE', 'WHATSAPP', 'GITHUB', etc)
 * for otp/magic link via email use 'channel': 'EMAIL' and 'email'
 * for otp/magic link via phone use 'channel': 'PHONE', 'phone' and 'countryCode'(optional)
 * @TODO activate your chosen authentication method from otpless Dashboard(https://otpless.com/dashboard/customer/channels) before executing this function
 * */
export const Authenticate = ({ channel = 'PHONE', channelType, phone, countryCode = '+91', email }) => {
	if (channel !== 'OAUTH' && channel !== 'EMAIL' && channel !== 'PHONE') {
		return Promise.reject({
			success: false,
			statusCode: 400,
			errorMessage: `Invalid channel ${channel}`
		})
	}
	if (channel === 'EMAIL' && !email) {
		return Promise.reject({
			success: false,
			statusCode: 400,
			errorMessage: 'Email is required'
		})
	}
	if (channel === 'PHONE' && !phone) {
		return Promise.reject({
			success: false,
			statusCode: 400,
			errorMessage: 'Phone is required'
		})
	}
	if (channel === 'OAUTH' && !channelType) {
		return Promise.reject({
			success: false,
			statusCode: 400,
			errorMessage: 'Channel type is required'
		})
	}
	return OTPlessSignin && OTPlessSignin.initiate({
		channel,
		channelType,
		phone,
		email,
		countryCode,
	})
}

/**
 * Verifies the OTP (One-Time Password) for the given authentication channel.
 *
 * @param {Object} params - The parameters for verifying the OTP.
 * @param {string} [channel='PHONE'] - The authentication channel (default: 'PHONE').
 * @param {string} otp - The OTP to be verified.
 * @param {string} [countryCode='+91'] - The country code for the user's phone number (default: '+91').
 * @param {string} phone - The user's phone number.
 * @param {string} email - The user's email address.
 * @return {Promise} A promise that resolves with the result of the verification.
 */
export const verifyOTP = async ({ channel = 'PHONE', otp, countryCode = '+91', phone, email }) => {
	try {
	  // Input validation
	  if (channel !== 'EMAIL' && channel !== 'PHONE') {
		throw {
		  success: false,
		  statusCode: 400,
		  errorMessage: `Invalid channel ${channel}`,
		};
	  }
	  if (channel === 'EMAIL' && !email) {
		throw {
		  success: false,
		  statusCode: 400,
		  errorMessage: 'Email is required',
		};
	  }
	  if (channel === 'PHONE' && !phone) {
		throw {
		  success: false,
		  statusCode: 400,
		  errorMessage: 'Phone is required',
		};
	  }
  
	  // Attempt OTP verification
	  const response = await OTPlessSignin?.verify({
		channel,
		phone,
		email,
		otp,
		countryCode,
	  });
  
	  
	  if(response){
		console.log('Response:', response);
		if(response.response.verification === "FAILED"){
			alert(response.response.errorMessage.split(":")[1])
		}
	  }
	  return response;
  
	} catch (error) {
	  // Handle network errors or verification issues
	  console.error('Error during OTP verification:', error);
	}
  };
  
  