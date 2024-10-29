import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import { jwtDecode } from "jwt-decode";
import AddOwnersFromForm from "../../../components/configurations/AddOwnersFromForm";
import {formatDate} from "../../../MyFunctions"


function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");


  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
        field: "serial",
        headerName: "No.",
        width: 70,
        valueGetter: (params) => params.api.getRowIndex(params.id) + 1, 
      },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },{
    field: "url",
    headerName: "Image",
    flex: 1,
    renderCell: (params) => (
        <a target="_blank" href={params.row.url} className="underline">See File</a>
      ),
  },
    {
      field: "enable",
      headerName: "Enabled",
      flex: 1,
    },

    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      valueGetter: (params) => formatDate(params.value),
    },
    

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
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

  const setModeToDisplay =()=>{
    setMode("display")
    fetchAllOwnersFrom(userId,userToken)
  }

  const FetchOwnersFrom = async (id) => {
    // Make the DELETE request
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/ownersFrom/fetchOwnerFrom/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          // console.log(response.data);
          setEditData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchAllOwnersFrom = (userId, userToken) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/ownersFrom/fetchAllOwnersFrom?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteOwnersFromById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/ownersFrom/deleteOwnersFrom/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          fetchAllOwnersFrom(userId, userToken);
          toast.success("Community deleted!");
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
        fetchAllOwnersFrom(decoded.userId, token);
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
    fetchAllOwnersFrom(userId,userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    FetchOwnersFrom(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteOwnersFromById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Owners From"
          subtitle={mode === "add" ? "Add owner's builder" : (mode === "edit" ? "Edit owner's builder details" : "Manage owner's builders here")}
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
        <AddOwnersFromForm  setModeToDisplay={setModeToDisplay}  userId={userId} userToken = {userToken}/>
      ) : mode === "edit" ? (
        editData && (
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
            <AddOwnersFromForm editData={editData} setModeToDisplay={setModeToDisplay} userId={userId} userToken = {userToken}/>{" "}
          </Box>
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
    </Box>
  )
}

export default Index