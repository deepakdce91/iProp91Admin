import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import ProjectsDataMasterForm from "../../../components/general/projectsDataMaster/ProjectsDataMasterForm";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import { TbCircleDotFilled } from "react-icons/tb";
import DeleteModal from "../../../components/ui/DeleteModal";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";
import * as XLSX from 'xlsx';


function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Function to extract filename from URL
  const getFilenameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'file';
      return filename;
    } catch (e) {
      return 'file';
    }
  };

  // Function to convert URL to document schema
  const convertUrlToDocument = (url) => {
    return {
      name: getFilenameFromUrl(url),
      path: url,
      addedBy: "admin"
    };
  };

  // Function to process media fields
  const processMediaField = (value) => {
    if (!value) return [];
    
    try {
      // If it's already a JSON string, parse it
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(url => typeof url === 'string' ? convertUrlToDocument(url) : url);
        } else if (typeof parsed === 'object') {
          return [parsed];
        }
      }
      
      // If it's a comma-separated string of URLs
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',')
          .map(url => url.trim())
          .filter(url => url)
          .map(url => convertUrlToDocument(url));
      }
      
      // If it's a single URL string
      if (typeof value === 'string' && value.trim()) {
        return [convertUrlToDocument(value.trim())];
      }
      
      return [];
    } catch (e) {
      console.error('Error processing media field:', e);
      return [];
    }
  };

  // Function to process coordinates field
  const processCoordinatesField = (value) => {
    if (!value) return [0, 0]; // Default coordinates
    
    try {
      // If it's already a JSON string, parse it
      if (typeof value === 'string' && value.startsWith('[')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length === 2) {
          return [Number(parsed[0]), Number(parsed[1])];
        }
      }
      
      // If it's a comma-separated string
      if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',').map(part => parseFloat(part.trim())).filter(num => !isNaN(num));
        if (parts.length === 2) {
          return parts;
        }
      }
      
      // If it's invalid or missing, return default
      return [0, 0];
    } catch (e) {
      console.error('Error processing coordinates field:', e);
      return [0, 0];
    }
  };

  // Function to map Excel columns to schema fields
  const mapRowToSchema = (row, headers) => {
    const mappedData = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase();
      if (row[index] !== undefined) {
        // Handle coordinates field
        if (normalizedHeader === 'coordinates') {
          mappedData[normalizedHeader] = processCoordinatesField(row[index]);
        }
        // Handle media fields
        else if (['images', 'videos', 'floorplan'].includes(normalizedHeader)) {
          mappedData[normalizedHeader] = processMediaField(row[index]);
        } else {
          mappedData[normalizedHeader] = row[index].toString();
        }
      }
    });
    return mappedData;
  };

  // Function to validate required fields
  const validateRow = (row, headers) => {
    const requiredFields = ['state', 'city', 'builder', 'project'];
    const mappedHeaders = headers.map(h => h.toLowerCase());
    
    for (let field of requiredFields) {
      const index = mappedHeaders.indexOf(field);
      if (index === -1 || !row[index]) {
        return false;
      }
    }
    return true;
  };

  // Function to handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setIsUploading(true);
    setUploadError("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          setUploadError("Excel file must contain headers and at least one data row");
          setIsUploading(false);
          return;
        }

        const headers = jsonData[0].map(header => header.toString().trim());
        const rows = jsonData.slice(1);
        let successCount = 0;
        let errorCount = 0;

        for (let row of rows) {
          if (!validateRow(row, headers)) {
            errorCount++;
            continue;
          }

          const mappedData = mapRowToSchema(row, headers);
          
          try {
            await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/addProject?userId=${userId}`,
              mappedData,
              {
                headers: {
                  "auth-token": userToken,
                }
              }
            );
            successCount++;
          } catch (error) {
            errorCount++;
            console.error("Error adding row:", error);
          }
        }

        toast.success(`Successfully added ${successCount} projects`);
        setRefetchNotification();
        if (errorCount > 0) {
          toast.warning(`${errorCount} projects failed validation or upload`);
        }
        
        fetchAllProjectsDataMaster(userId, userToken);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError("Error processing file");
    } finally {
      setIsUploading(false);
      event.target.value = null; // Reset file input
    }
  };

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else if (params.row.isViewed === "red") {
          return <TbCircleDotFilled className="text-red-400" />;
        } else {
          return <TbCircleDotFilled onClick={()=>{
            handleMarkUnread(params.row._id);
          }} className="text-gray-400 cursor-pointer" />;
        }
      },
    },

    { field: "_id", headerName: "ID",  width: 100 },
    {
      field: "propertyId",
      headerName: "Property Id",
      width: 100,
      cellClassName: "name-column--cell",
    },
    {
      field: "state",
      headerName: "State",
      width: 180,
    },
    {
      field: "city",
      headerName: "City",
      width: 180,
    },
    {
      field: "pincode",
      headerName: "Pincode",
      width: 180,
    },
    
    {
      field: "builder",
      headerName: "Builder",
      width: 180,
    },
    {
      field: "project",
      headerName: "Project",
      width: 180,
    },
    {
      field: "type",
      headerName: "Type",
      width: 180,
    },
    {
      field: "category",
      headerName: "Category",
      width: 180,
    },
    {
      field: "bhk",
      headerName: "Bhk",
      width: 180,
    }, 
    {
      field: "status",
      headerName: "Status",
      width: 150,
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
    },
    {
      field: "minimumPrice",
      headerName: "Min Price",
      width: 160,
    },
    {
      field: "listingId",
      headerName: "From Listings",
      valueGetter: (params) => {
        if(params.value !== "none"){
          return `Yes (${params.value})`;
        }else{
          return "No"
        }

      },
      width: 180,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            onClick={() => {
              handleShowDetails(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              handleEdit(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }}

            }}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(params.row._id,params.row.isViewed)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const decreaseCounter = async (userId, userToken, type) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/decreaseCounter?userId=${userId}`,

        {
          type,
        },
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setRefetchNotification(); //reset value on sidebar
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchAllProjectsDataMaster = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/fetchAllProjects?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteProjectsMasterById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/deleteProject/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Project deleted!");
          if(myIsViewed === "no"){
            decreaseCounter(userId, userToken, "newProjectsDataMasters");
          }
          setDeleteId();
          fetchAllProjectsDataMaster(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  // useeffecttt
  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllProjectsDataMaster(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    setMode("display");
    setEditData();
    fetchAllProjectsDataMaster(userId, userToken);
    setRefetchNotification();
  };

  // Click handler for the edit button
  const handleEdit = (data) => {
    // fetchProperty(id);
    setEditData(data);
    setMode("edit");
  };

  // to show the details of property
  const handleShowDetails = (data) => {
    setEditData(data);
    setMode("showDetails");
  };

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    setRefetchNotification();
    fetchAllProjectsDataMaster(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id,isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
  };

  const toggleProjectDataMasterViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/${
          to === "yes"
            ? "setProjectsMasterViewed"
            : to === "red"
            ? "setProjectsMasterViewedRed"
            : "setProjectsMasterNotViewed"
        }/${id}?userId=${userId}`,
        {}, // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          fetchAllProjectsDataMaster(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Projects Data Master"
          subtitle={
            mode === "add"
              ? "Add Projects Data Master"
              : mode === "edit"
              ? "Edit Projects Data Master"
              : mode === "showDetails"
              ? "See property details"
              : "Manage Projects Data Master here"
          }
        />

<Box display="flex" gap={2}>
          {mode === "display" && (
            <div className="flex items-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="excel-upload" 
                className={`border-2 border-green-600 rounded-lg px-3 py-2 text-green-400 cursor-pointer hover:bg-green-600 hover:text-green-200 flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UploadFileIcon />
                {isUploading ? 'Uploading...' : 'Upload Excel'}
              </label>
            </div>
          )}
          
          {mode === "display" ? (
            <div
              className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
              onClick={handleAddMore}
            >
              Add more
            </div>
          ) : (
            <div
              className="border-2 mr-12 border-red-600 rounded-lg px-3 py-2 text-red-400 cursor-pointer hover:bg-red-600 hover:text-red-200"
              onClick={handleCancel}
            >
              Back
            </div>
          )}
        </Box>
      </Box>

      

      {uploadError && (
        <div className="text-red-500 mt-2">{uploadError}</div>
      )}

      {/* Render form or DataGrid based on mode */}
      {1 === 1 && (
        <>
          {mode === "add" ? (
            <ProjectsDataMasterForm
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />
          ) : mode === "edit" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  userId={userId}
                  userToken={userToken}
                  editData={editData}
                  setModeToDisplay={setModeToDisplay}
                />
              </>
            )
          ) : mode === "showDetails" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  displayMode={true}
                  editData={editData}
                />
              </>
            )
          ) : (
            <Box
              m="40px 0 0 0"
              height="75vh"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
                "& .name-column--cell": {
                  color: colors.greenAccent[300],
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: colors.blueAccent[700],
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "none",
                  backgroundColor: colors.blueAccent[700],
                },
                "& .MuiCheckbox-root": {
                  color: `${colors.greenAccent[200]} !important`,
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  color: `${colors.grey[100]} !important`,
                },
              }}
            >
              <DataGrid
                rows={data}
                columns={columns}
                components={{ Toolbar: GridToolbar }}
                getRowId={(row) => row._id}
                autoHeight
                disableExtendRowFullWidth={true}
                scrollbarSize={10}
              />
            </Box>
          )}
        </>
      )}
      {showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteProjectsMasterById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleProjectDataMasterViewed(unreadId, "red");
          }}
          closeModal={() => {
            setShowUnreadModal(false);
          }}
        />
      )}
    </Box>
  );
}

export default Index;