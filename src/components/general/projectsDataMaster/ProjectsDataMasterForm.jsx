import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { removeSpaces } from "../../../MyFunctions";
import { supabase } from "../../../config/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

function ProjectsDataMasterForm({ editData, setModeToDisplay, userToken, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    propertyId: "",
    availableFrom: "",
    unitNumber: "",
    size: "",
    expectedRent: "",
    securityDeposit: "",
    furnishedStatus: "",
    type: "",
    numberOfWashrooms: "",
    numberOfFloors: "",
    numberOfParkings: "",
    isActive: "true",
    media: [],
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_SITE_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
 
    console.log("Public URL:", data.publicUrl);
    return {
      name: path.split("/")[path.split("/").length - 1],
      url: data.publicUrl,
    };
  };

  const uploadFileToCloud = async (myFile) => {
    const myFileName = removeSpaces(myFile.name);
    const myPath = `RentListings/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_SITE_BUCKET,
        Key: myPath,
        Body: myFile,
        ContentType: myFile.type,
      };
      const command = new PutObjectCommand(uploadParams);
      await client.send(command);
      return myPath;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (addData.media.length + files.length > 15) {
      toast.error("Maximum 15 files allowed");
      return;
    }

    setIsUploading(true);
    toast("Uploading files...");

    try {
      for (const file of files) {
        const cloudFilePath = await uploadFileToCloud(file);
        if (cloudFilePath) {
          const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
          if (publicUrl) {
            setAddData(prev => ({
              ...prev,
              media: [...prev.media, publicUrl]
            }));
          }
        }
      }
      setIsUploading(false);
      toast.success("Files uploaded successfully");
    } catch (error) {
      setIsUploading(false);
      toast.error("Error uploading files");
      console.error(error);
    }
  };

  const handleRemoveImage = (index) => {
    setAddData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      addData.propertyId !== "" &&
      addData.availableFrom !== "" &&
      addData.unitNumber !== "" &&
      addData.size !== "" &&
      addData.expectedRent !== "" &&
      addData.securityDeposit !== "" &&
      addData.furnishedStatus !== "" &&
      addData.type !== "" &&
      addData.numberOfWashrooms !== "" &&
      addData.numberOfFloors !== "" &&
      addData.numberOfParkings !== "" &&
      addData.isActive !== ""
    ) {

       const reqData = editData ? 
  { 
    ...editData, 
    rentDetails: { availableFrom: addData.availableFrom,
        unitNumber: addData.unitNumber,
        size: addData.size,
        expectedRent: addData.expectedRent,
        securityDeposit: addData.securityDeposit,   
        type: addData.type,
        furnishedStatus: addData.furnishedStatus,   
        numberOfWashrooms: addData.numberOfWashrooms,
        numberOfFloors: addData.numberOfFloors,
        numberOfParkings: addData.numberOfParkings,
        isActive: addData.isActive,
        media: addData.media,} 
  } : {
    propertyId: addData.propertyId,
    rentDetails: {
        availableFrom: addData.availableFrom,
        unitNumber: addData.unitNumber,
        size: addData.size,
        expectedRent: addData.expectedRent,
        securityDeposit: addData.securityDeposit,   
        type: addData.type,
        furnishedStatus: addData.furnishedStatus,   
        numberOfWashrooms: addData.numberOfWashrooms,
        numberOfFloors: addData.numberOfFloors,
        numberOfParkings: addData.numberOfParkings,
        isActive: "true",
        media: addData.media,
    }
};

      const endpoint = editData 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/listings/updaterentlisting/${editData._id}?userId=${userId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/listings/addrentlisting?userId=${userId}`;
      
      const method = editData ? 'put' : 'post';
      
      axios[method](endpoint, reqData, {
        headers: {
          "auth-token": userToken,
        },
      })
        .then((response) => {
          if (response) {
            toast.success(editData ? "Rent listing updated!" : "Rent listing Added!");
            setTimeout(() => {
              setModeToDisplay();
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
    } else {
      toast.error("Fill all the fields.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        propertyId: editData.propertyId,
        availableFrom: editData.rentDetails.availableFrom,
        unitNumber: editData.rentDetails.unitNumber,
        size: editData.rentDetails.size,
        expectedRent: editData.rentDetails.expectedRent,
        securityDeposit: editData.rentDetails.securityDeposit,
        furnishedStatus: editData.rentDetails.furnishedStatus,
        type: editData.rentDetails.type,
        numberOfWashrooms: editData.rentDetails.numberOfWashrooms,
        numberOfFloors: editData.rentDetails.numberOfFloors,
        numberOfParkings: editData.rentDetails.numberOfParkings,
        isActive: editData.rentDetails.isActive,
        media: editData.rentDetails.media,
      });
    }
  }, [editData]);

  return (
    <Box sx={{
      padding: "24px",
      "& .MuiInputBase-root": {
        backgroundColor: colors.primary[400],
        color: colors.grey[100],
        borderRadius: "4px",
        "&:hover": {
          borderColor: colors.blueAccent[700],
        },
        "& input": {
          color: "#000000",
        },
      },
      "& .MuiInputLabel-root": {
        color: colors.grey[300],
        "&.Mui-focused": {
          color: colors.blueAccent[700],
        },
      },
    }}>
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-5">
                <label htmlFor="propertyId" className="mb-3 block text-base font-medium">
                  Property ID
                </label>
                <input
                  type="text"
                  name="propertyId"
                  id="propertyId"
                  value={addData.propertyId}
                  onChange={(e) => changeField("propertyId", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="availableFrom" className="mb-3 block text-base font-medium">
                  Available From
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  id="availableFrom"
                  value={addData.availableFrom}
                  onChange={(e) => changeField("availableFrom", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="unitNumber" className="mb-3 block text-base font-medium">
                  Unit Number
                </label>
                <input
                  type="text"
                  name="unitNumber"
                  id="unitNumber"
                  value={addData.unitNumber}
                  onChange={(e) => changeField("unitNumber", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="size" className="mb-3 block text-base font-medium">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  name="size"
                  id="size"
                  value={addData.size}
                  onChange={(e) => changeField("size", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="expectedRent" className="mb-3 block text-base font-medium">
                  Expected Rent
                </label>
                <input
                  type="number"
                  name="expectedRent"
                  id="expectedRent"
                  value={addData.expectedRent}
                  onChange={(e) => changeField("expectedRent", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="securityDeposit" className="mb-3 block text-base font-medium">
                  Security Deposit
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  id="securityDeposit"
                  value={addData.securityDeposit}
                  onChange={(e) => changeField("securityDeposit", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="furnishedStatus" className="mb-3 block text-base font-medium">
                  Furnished Status
                </label>
                <select
                  name="furnishedStatus"
                  id="furnishedStatus"
                  value={addData.furnishedStatus}
                  onChange={(e) => changeField("furnishedStatus", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Status</option>
                  <option value="furnished">Furnished</option>
                  <option value="nonFurnished">Non Furnished</option>
                </select>
              </div>

              <div className="mb-5">
                <label htmlFor="type" className="mb-3 block text-base font-medium">
                  Property Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={addData.type}
                  onChange={(e) => changeField("type", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independentHouse">Independent House</option>
                  <option value="plot">Plot</option>
                </select>
              </div>

              <div className="mb-5">
                <label htmlFor="numberOfWashrooms" className="mb-3 block text-base font-medium">
                  Number of Washrooms
                </label>
                <input
                  type="number"
                  name="numberOfWashrooms"
                  id="numberOfWashrooms"
                  value={addData.numberOfWashrooms}
                  onChange={(e) => changeField("numberOfWashrooms", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="numberOfFloors" className="mb-3 block text-base font-medium">
                  Number of Floors
                </label>
                <input
                  type="number"
                  name="numberOfFloors"
                  id="numberOfFloors"
                  value={addData.numberOfFloors}
                  onChange={(e) => changeField("numberOfFloors", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="numberOfParkings" className="mb-3 block text-base font-medium">
                  Number of Parkings
                </label>
                <input
                  type="number"
                  name="numberOfParkings"
                  id="numberOfParkings"
                  value={addData.numberOfParkings}
                  onChange={(e) => changeField("numberOfParkings", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Active Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    className="h-5 w-5"
                    checked={addData.isActive === "true"}
                    onChange={(e) => changeField("isActive", e.target.value)}
                  />
                  <label className="pl-3 text-base font-medium">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    className="h-5 w-5"
                    checked={addData.isActive === "false"}
                    onChange={(e) => changeField("isActive", e.target.value)}
                  />
                  <label className="pl-3 text-base font-medium">Inactive</label>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Property Images (Max 15)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                disabled={isUploading || addData.media.length >= 15}
              />
              <div className="text-sm text-gray-500 mt-1">
                {15 - addData.media.length} slots remaining
              </div>
            </div>

            {addData.media.length > 0 && (
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium">
                  Uploaded Images
                </label>
                <div className="flex flex-row flex-wrap gap-4">
                  {addData.media.map((file, index) => (
                    <div key={index} className="flex items-center justify-center border-1 border">
                      <p className="my-1 py-1 px-2">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="top-2 m-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className={`px-8 py-3 ${
                  isUploading ? "bg-gray-600" : "bg-[#6A64F1]"
                } text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading ? "" : "hover:bg-[#5a52e0]"
                } focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
              >
                {isUploading ? "Uploading..." : (editData ? "Update Rent listing" : "Add Rent listing")}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ProjectsDataMasterForm;