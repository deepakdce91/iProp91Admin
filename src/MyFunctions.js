

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


export function getUniqueItems(arr) {
    return [...new Set(arr)];
  };

export function removeSpaces(str) {
  return str.replace(/\s+/g, '');
}

///// supabase upload and fetch functions


