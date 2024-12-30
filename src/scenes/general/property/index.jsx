import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import PropertyForm from "../../../components/general/property/PropertyForm";
import ShowPropertDetails from "../../../components/general/property/ShowPropertDetails";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import { TbCircleDotFilled } from "react-icons/tb";

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else {
          return "";
        }
      },
    },
    { field: "_id", headerName: "ID", width: 80 },
    {
      field: "customerName",
      headerName: "House No.",
      width: 120,
      cellClassName: "name-column--cell",
    },
    {
      field: "customerNumber",
      width: 120,
      headerName: "Customer No.",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "state",
      headerName: "State",
      width: 110,
    },
    {
      field: "city",
      headerName: "City",
      width: 110,
    },
    {
      field: "builder",
      headerName: "Builder",
      width: 120,
    },
    {
      field: "project",
      headerName: "Project",
      width: 120,
    },
    {
      field: "addedBy",
      headerName: "Added By",
      headerAlign: "left",
      align: "left",
      width: 80,
    },

    {
      field: "isDeleted",
      headerName: "Deleted",
      headerAlign: "left",
      align: "left",
      width: 80,
    },

    {
      field: "applicationStatus",
      headerName: "Status",
      headerAlign: "left",
      align: "left",
      width: 120,
    },

    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {handleShowDetails(params.row._id); setPropertyViewed(params.row._id)}}  
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            onClick={() => {handleEdit(params.row._id); setPropertyViewed(params.row._id)}}
            // color="primary"
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const resetCounter = async (userId, userToken, type) => {
    await axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/resetCounter?userId=${userId}`,

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

  const fetchProperty = async (id) => {
    // Make the DELETE request
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/property/fetchproperty/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setEditData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchAllProperties = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/property/fetchallproperties?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setData(response.data);
        // also reset counter when item displayed
        resetCounter(userId, userToken, "newProperties");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deletePropertyById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/property/deleteproperty/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Property deleted!");
          fetchAllProperties(userId, userToken);
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
        fetchAllProperties(decoded.userId, token);
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
    fetchAllProperties(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchProperty(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // to show the details of property
  const handleShowDetails = (id) => {
    fetchProperty(id);

    setTimeout(() => {
      setMode("showDetails");
    }, 500);
  };

  const setModeToDisplay = () => {
    setMode("display");
    fetchAllProperties(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deletePropertyById(id);
  };

  const setPropertyViewed = async (id) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/property/setPropertyViewed/${id}?userId=${userId}`,
        {},  // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
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
          title="Properties"
          subtitle={
            mode === "add"
              ? "Add a property"
              : mode === "edit"
              ? "Edit the property details"
              : mode === "showDetails"
              ? "See property details"
              : "Manage properties here"
          }
        />

        <Box>
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

      {/* Render form or DataGrid based on mode */}
      {mode === "add" ? (
        <PropertyForm
          setModeToDisplay={setModeToDisplay}
          userId={userId}
          userToken={userToken}
        />
      ) : mode === "edit" ? (
        editData && (
          <>
            {/* <ShowPropertDetails data={editData} /> */}
            <PropertyForm
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
            <ShowPropertDetails data={editData} />
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
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
