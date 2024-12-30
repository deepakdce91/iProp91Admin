import React, { useState, useEffect } from "react";
import { Upload, File, Trash2, Download, Eye } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { removeSpaces } from "../../MyFunctions";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ManageCommonSafe = ({ safeId }) => {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [uploadLoading, setUploadLoading] = useState({}); 

  const userToken = localStorage.getItem("iProp-token");
  const decoded = jwtDecode(userToken);
  const userId = decoded.userId;

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const documentCategories = [
    "layoutPlan",
    "demarcationCumZoningPlan",
    "sitePlan",
    "buildingPlan",
    "floorPlan",
    "reraApplication",
    "projectBrochure",
    "advertisementMaterialByBulder",
    "agreementToSale",
    "builderBuyerAgreement",
    "demandLetter",
    "paymentPlan",
    "specificationsAmenitiesAndFacilities",
    "occupationCertificate",
    "saleDeed",
    "maintenenceAgreement",
    "maintenencePaymentReceipts",
    "maintenenceInvoice",
    "bill",
    "warrantyDocuments",
    "amcs",
    "electricityOrMaintenenceBills",
    "rwaRulesAndRegulations",
    "other",
    "loanAgreement",
    "paymentPlanLoan",
    "rentAgreementOrExtensionsOrAmendmentAgreement",
    "tenantKycDocuments",
    "rentReceipt",
    "tdsPaymentChalaan",
    "handbook",
    "loanHandbook",
    "keyTermRentalHandbook",
    "recentUpdates",
    "allotmentLetter",
    "reraApproval",
  ];


   // Upload the file to Supabase S3
   const uploadFileToCloud = async (safeId, fieldName, myFile) => {
    const myFileName = removeSpaces(myFile.name); // removing blank space from name
    const myPath = `documentsSafe/${safeId}/${fieldName}/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      await client.send(command);
      return { myFileName, myPath }; // return the file path and name
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

   // Function to get signed URL
   const getSignedUrlForPrivateFile = async (path) => {
    try {
      const getParams = {
        Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
        Key: path,
        ResponseContentDisposition: "inline",
      };

      const command = new GetObjectCommand(getParams);
      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600,
      }); // URL valid for 1 hour

      return signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  };

  const formatCategoryName = (category) => {
    return category
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Fetch documents for the safe
  useEffect(() => {
    const fetchDocuments = async () => {
      try { 
        const response = await axios.get(
          `${baseURL}/api/commonSafe/fetchall?userId=${userId}`,
          {
            headers: {
              "auth-token": userToken,
            }, 
          }
        );

        if (response && response.data) {
            console.log(response.data)
          setDocuments(response.data.documents || {});
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch documents");
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [safeId, baseURL, userId, userToken]);

  // Handle file upload
  const handleFileUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading((prev) => ({ ...prev, [category]: true }));
    try {
      // Upload to Supabase
      const { myPath } = await uploadFileToCloud(safeId, category, file);

      // Add document to API
      const response = await axios.post(
        `${baseURL}/api/commonSafe/addDocument/${safeId}/${category}?userId=${userId}`,
        {
          name: file.name,
          path: myPath,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": userToken,
          },
        }
      );

      if (response && response.data) {
        setDocuments(response.data.documents || {});
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to upload document");
    } finally {
      setUploadLoading((prev) => ({ ...prev, [category]: false }));
    }
  };

  // Handle document deletion
  const handleDelete = async (category, documentId) => {
    try {
      const response = await axios.delete(
        `${baseURL}/api/commonSafe/removeDocument/${safeId}/${category}/${documentId}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );

      if (response && response.data) {
        setDocuments(response.data.documents || {});
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to delete document");
    }
  };

  // Handle document view/download
  const handleViewDocument = async (path, isDownload = false) => {
    try {
      const signedUrl = await getSignedUrlForPrivateFile(path);
      if (isDownload) {
        window.location.href = signedUrl;
      } else {
        window.open(signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to access document");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="w-full space-y-4">
      {documentCategories.map((category) => (
        <div key={category} className="border rounded-lg">
          <button
            onClick={() =>
              setOpenAccordion(openAccordion === category ? null : category)
            }
            className="w-full p-4 flex justify-between items-center  rounded-t-lg"
          >
            <span className="font-medium">{formatCategoryName(category)}</span>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded-md flex items-center">
                <Upload className="w-4 h-4 mr-1" />
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, category)}
                  disabled={uploadLoading[category]}
                />
              </label>
            </div>
          </button>

          {openAccordion === category && (
            <div className="p-4 border-t">
              {documents[category]?.length > 0 ? (
                <div className="space-y-2">
                  {documents[category].map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="flex items-center">
                        <File className="w-4 h-4 mr-2" />
                        {doc.name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(doc.path)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDocument(doc.path, true)}
                          className="p-1 text-green-500 hover:text-green-700"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category, doc._id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No documents uploaded
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageCommonSafe;
