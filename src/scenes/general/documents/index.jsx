import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { toast } from "react-toastify";


import Header from "../../../components/Header";
import PropertyForm from "../../../components/general/property/PropertyForm";
import ShowPropertDetails from "../../../components/general/property/ShowPropertDetails";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import AddSafe from "../../../components/general/documents/AddSafe";
import EditSafe from "../../../components/general/documents/EditSafe";
import AccordionCustomIcon from "../../../components/ui/Accordion";

function Index({setRefetchNotification}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    { field: "_id", 
      headerName: "ID", 
      flex: 1,
    },
    {
      field: "propertyId",
      headerName: "Property Id",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueGetter: (params) => formatDate(params.value),
    },

    {
      field: "updatedAt",
      headerName: "Updated",
      flex: 1,
      valueGetter: (params) => formatDate(params.value),
    },

    {
      field: "action",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => (
        <Box>

          <IconButton
            onClick={() => handleEdit(params.row.propertyId)}
            // color="primary"
            className="text-grey-400"
          >
            <EditIcon />
          
          </IconButton>
        </Box>
      ),
    },
  ];

  const resetCounter = async (userId, userToken,type) => {
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
          console.log("Item viewed.");
          setRefetchNotification(); //reset value on sidebar
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchDocSafe = async (propertyId) => {
    // get edit data
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminFetchAllDocuments/${propertyId}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setEditData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
       
      });
  };

  const fetchAllDocSafes = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminFetchAllSafes?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {

        setData(response.data.data);
        // also reset counter when item displayed
        resetCounter(userId, userToken,"newDocuments");
      })
      .catch((error) => {
        console.error("Error:", error);
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
        fetchAllDocSafes(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }

  }, []);


  const handleCancel = () => {
    setMode("display");
    fetchAllDocSafes(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchDocSafe(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Documents Safe"
          subtitle={mode === "edit"
              ? "Edit the Safe "
              : "Manage document safes here"
          }
        />

        <Box>
          {mode === "edit" && (
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
      { mode === "edit" ? (
        editData && (
          <>
          <AccordionCustomIcon userId={userId} userToken={userToken} propertyId={editData.propertyId} safeData = {editData}/>

          </>
        )
      ): (
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
    </Box>
  );
}

export default Index;
