import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import RejectedReasonsForm from "../../../components/configurations/RejectedReasonsForm";
import {formatDate} from "../../../MyFunctions"
import { jwtDecode } from "jwt-decode";


function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");


  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "name",
      headerName: "Rejected Reason",
      flex: 1.5,
      cellClassName: "name-column--cell",
    },
    {
      field: "addedBy",
      headerName: "Added By",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },

    {
      field: "enable",
      headerName: "Enabled",
      headerAlign: "left",
      align: "left",
      flex: 0.5,
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

  const fetchReason = async (id) => {
    // Make the DELETE request
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/rejectedReasons/fetchReason/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
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

  const fetchAllReasons = (userId, userToken) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/rejectedReasons/fetchAllReasons?userId=${userId}`, {
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

  const deleteRejectedReasonById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/rejectedReasons/deleteReason/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          toast.success("Rejected Reason deleted!");
          fetchAllReasons(userId, userToken);
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
        fetchAllReasons(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    fetchAllReasons(userId, userToken);
    setMode("display");
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchReason(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteRejectedReasonById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Rejected Reasons"
          subtitle={mode === "add" ? "Add a Rejected Reason" : (mode === "edit" ? "Edit the Rejected Reason " : "Manage Rejected Reasons here")}
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
        <RejectedReasonsForm userId={userId} userToken = {userToken} />
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
            <RejectedReasonsForm editData={editData}  userId={userId} userToken = {userToken}/>{" "}
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
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
