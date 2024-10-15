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
import UsersForm from "../../../components/general/users/UsersForm";
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
      field: "name",
      headerName: "Username",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "lastLogin",
      headerName: "Builder",
      flex: 1,
    },
    {
      field: "fraud",
      headerName: "Fraud",
      flex: 1,
    },
    {
      field: "suspended",
      headerName: "Suspended",
      headerAlign: "left",
      align: "left",
      flex: 1,
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
          {/* <IconButton
            onClick={() => handleShowDetails(params.row._id)}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon/>
          </IconButton> */}

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

  const fetchUser = async (id) => {
    // Make the DELETE request
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/users/fetchuserforadmin/${id}?userId=${userId}`,  {
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

  const fetchAllUsers = (userId, userToken) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/users/fetchallusers?userId=${userId}`,  {
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

  const deleteUserById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/deleteuser/${id}?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
        if (response) {
          toast("User deleted!");
          fetchAllUsers(userId, userToken);
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
        fetchAllUsers(decoded.userId, token);
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
    fetchAllUsers(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchUser(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };


  const setModeToDisplay = () => {
    setMode("display");
    fetchAllUsers(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteUserById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Users"
          subtitle={
            mode === "add"
              ? "Add a user"
              : mode === "edit"
              ? "Edit the user details"
              : "Manage users here"
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
        <UsersForm userId = {userId}
        userToken = {userToken} setModeToDisplay={setModeToDisplay} />
      ) : mode === "edit" ? (
        editData && (
          <>
            {/* <ShowPropertDetails data={editData} /> */}
            <UsersForm
              editData={editData}
              userId = {userId}
              userToken = {userToken}
              setModeToDisplay={setModeToDisplay}
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
          />
        </Box>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
