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

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "customerName",
      headerName: "House No.",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "customerNumber",
      headerName: "Customer No.",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "state",
      headerName: "State",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "project",
      headerName: "City",
      flex: 1,
    },
    {
      field: "builder",
      headerName: "Builder",
      flex: 1,
    },
    {
      field: "addedBy",
      headerName: "Added By",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },

    {
      field: "isDeleted",
      headerName: "Deleted",
      headerAlign: "left",
      align: "left",
      flex: 0.5,
    },

    {
      field: "applicationStatus",
      headerName: "Status",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },

    {
      field: "action",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleShowDetails(params.row._id)}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            onClick={() => handleEdit(params.row._id)}
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
        <PropertyForm setModeToDisplay={setModeToDisplay} userId={userId} userToken={userToken} />
      ) : mode === "edit" ? (
        editData && (
          <>
            {/* <ShowPropertDetails data={editData} /> */}
            <PropertyForm
            userId={userId} userToken={userToken}
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
          />
        </Box>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
