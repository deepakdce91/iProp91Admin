

export function formatDate(dateString) {
    const date = new Date(dateString);
  
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
  
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

export function getNameList(arrayOfObjects) {
  return arrayOfObjects.map((obj) => obj.name);
};

export function getDate(dateString) {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const dateObj = new Date(dateString);
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

export function getTime(dateString) {
  const dateObj = new Date(dateString);
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}


export function getUniqueItems(arr) {
    return [...new Set(arr)];
  };

export function removeSpaces(str) {
  return str.replace(/\s+/g, '');
}


 export function sortArrayByName(arr) {
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }

export function validateEmail(email) {
    // Regular expression for basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Test the email against the regex
    return emailRegex.test(email);
  }

  export function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  }


export async function handleDownload  (myUrl) {
  const fileUrl = myUrl; // Replace with your file link
  const response = await fetch(fileUrl);
  
  // Check if the response is successful
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const blob = await response.blob(); // Get the file as a Blob
  const url = window.URL.createObjectURL(blob); // Create a Blob URL

  const link = document.createElement('a'); // Create a link element
  link.href = url;
  
  // Use the filename from user input or default to 'filename.pdf' if empty
  link.setAttribute('download', "document"); 

  // Append to the body and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up and remove the link
  link.parentNode.removeChild(link);
};