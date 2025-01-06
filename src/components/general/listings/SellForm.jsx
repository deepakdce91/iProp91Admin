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

function SellForm({ editData, setModeToDisplay, userToken, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    propertyId: "",
    unitNumber: "",
    size: "",
    expectedPrice: "",
    type: "",
    numberOfWashrooms: "",
    numberOfBedrooms: "",
    numberOfFloors: "",
    numberOfParkings: "",
    isActive: "true",
    titleDeed: [],
    propertyPhotos: [],
    propertyVideos: [],
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_SITE_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return {
      name: path.split("/")[path.split("/").length - 1],
      url: data.publicUrl,
    };
  };

  const uploadFileToCloud = async (myFile, folderName) => {
    const myFileName = removeSpaces(myFile.name);
    const myPath = `SellListings/${folderName}/${myFileName}`;
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

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    const maxFiles = type === 'propertyPhotos' ? 15 : 5;
    const currentFiles = addData[type].length;

    if (currentFiles + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed for ${type}`);
      return;
    }

    setIsUploading(true);
    toast("Uploading files...");

    try {
      for (const file of files) {
        const folderName = type === 'titleDeed' ? 'Deeds' : 
                          type === 'propertyPhotos' ? 'Photos' : 'Videos';
        const cloudFilePath = await uploadFileToCloud(file, folderName);
        if (cloudFilePath) {
          const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
          if (publicUrl) {
            setAddData((prev) => ({
              ...prev,
              [type]: [...prev[type], publicUrl],
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

  const handleRemoveFile = (index, type) => {
    setAddData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
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
      addData.unitNumber !== "" &&
      addData.size !== "" &&
      addData.expectedPrice !== "" &&
      addData.type !== "" &&
      addData.numberOfWashrooms !== "" &&
      addData.numberOfBedrooms !== "" &&
      addData.numberOfFloors !== "" &&
      addData.numberOfParkings !== "" &&
      addData.isActive !== ""
    ) {
      const reqData = editData
        ? {
            ...editData,
            sellDetails: {
              unitNumber: addData.unitNumber,
              size: addData.size,
              expectedPrice: addData.expectedPrice,
              type: addData.type,
              numberOfWashrooms: addData.numberOfWashrooms,
              numberOfBedrooms: addData.numberOfBedrooms,
              numberOfFloors: addData.numberOfFloors,
              numberOfParkings: addData.numberOfParkings,
              isActive: addData.isActive,
              titleDeed: addData.titleDeed,
              propertyPhotos: addData.propertyPhotos,
              propertyVideos: addData.propertyVideos,
            },
          }
        : {
            propertyId: addData.propertyId,
            sellDetails: {
              unitNumber: addData.unitNumber,
              size: addData.size,
              expectedPrice: addData.expectedPrice,
              type: addData.type,
              numberOfWashrooms: addData.numberOfWashrooms,
              numberOfBedrooms: addData.numberOfBedrooms,
              numberOfFloors: addData.numberOfFloors,
              numberOfParkings: addData.numberOfParkings,
              isActive: "true",
              titleDeed: addData.titleDeed,
              propertyPhotos: addData.propertyPhotos,
              propertyVideos: addData.propertyVideos,
            },
          };

      const endpoint = editData
        ? `${process.env.REACT_APP_BACKEND_URL}/api/listings/updatesalelisting/${editData._id}?userId=${userId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/listings/addsalelisting?userId=${userId}`;

      const method = editData ? "put" : "post";

      axios[method](endpoint, reqData, {
        headers: {
          "auth-token": userToken,
        },
      })
        .then((response) => {
          if (response) {
            toast.success(
              editData ? "Sell listing updated!" : "Sell listing Added!"
            );
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
        unitNumber: editData.sellDetails.unitNumber,
        size: editData.sellDetails.size,
        expectedPrice: editData.sellDetails.expectedPrice,
        type: editData.sellDetails.type,
        numberOfWashrooms: editData.sellDetails.numberOfWashrooms,
        numberOfBedrooms: editData.sellDetails.numberOfBedrooms,
        numberOfFloors: editData.sellDetails.numberOfFloors,
        numberOfParkings: editData.sellDetails.numberOfParkings,
        isActive: editData.sellDetails.isActive,
        titleDeed: editData.sellDetails.titleDeed,
        propertyPhotos: editData.sellDetails.propertyPhotos,
        propertyVideos: editData.sellDetails.propertyVideos,
      });
    }
  }, [editData]);

  return (
    <Box
      sx={{
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
      }}
    >
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-5">
                <label htmlFor="propertyId" className="mb-3 block text-base font-medium">
                  PropertyId
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
                  type="text"
                  name="size"
                  id="size"
                  value={addData.size}
                  onChange={(e) => changeField("size", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="expectedPrice" className="mb-3 block text-base font-medium">
                  Expected Price
                </label>
                <input
                  type="text"
                  name="expectedPrice"
                  id="expectedPrice"
                  value={addData.expectedPrice}
                  onChange={(e) => changeField("expectedPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
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
                <label htmlFor="numberOfBedrooms" className="mb-3 block text-base font-medium">
                  Number of Bedrooms
                </label>
                <input
                  type="text"
                  name="numberOfBedrooms"
                  id="numberOfBedrooms"
                  value={addData.numberOfBedrooms}
                  onChange={(e) => changeField("numberOfBedrooms", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="numberOfWashrooms" className="mb-3 block text-base font-medium">
                  Number of Washrooms
                </label>
                <input
                  type="text"
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
                  type="text"
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
                  type="text"
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

            {/* Title Deed Upload Section */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Title Deed Documents (Max 5)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'titleDeed')}
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                disabled={isUploading || addData.titleDeed.length >= 5}
              />
              <div className="text-sm text-gray-500 mt-1">
                {5 - addData.titleDeed.length} slots remaining
              </div>
              {addData.titleDeed.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-row flex-wrap gap-4">
                    {addData.titleDeed.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center border-1 border"
                      >
                        <p className="my-1 py-1 px-2">{file.name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'titleDeed')}
                          className="m-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Photos Upload Section */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Property Photos (Max 15)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'propertyPhotos')}
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                disabled={isUploading || addData.propertyPhotos.length >= 15}
              />
              <div className="text-sm text-gray-500 mt-1">
                {15 - addData.propertyPhotos.length} slots remaining
              </div>
              {addData.propertyPhotos.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-row flex-wrap gap-4">
                    {addData.propertyPhotos.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center border-1 border"
                      >
                        <p className="my-1 py-1 px-2">{file.name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'propertyPhotos')}
                          className="m-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Videos Upload Section */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Property Videos (Max 5)
              </label>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'propertyVideos')}
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                disabled={isUploading || addData.propertyVideos.length >= 5}
              />
              <div className="text-sm text-gray-500 mt-1">
                {5 - addData.propertyVideos.length} slots remaining
              </div>
              {addData.propertyVideos.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-row flex-wrap gap-4">
                    {addData.propertyVideos.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center border-1 border"
                      >
                        <p className="my-1 py-1 px-2">{file.name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'propertyVideos')}
                          className="m-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                {isUploading
                  ? "Uploading..."
                  : editData
                  ? "Update Sell Listing"
                  : "Add Sell Listing"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default SellForm;