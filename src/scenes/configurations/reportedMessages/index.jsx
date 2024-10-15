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
import { IoEyeSharp } from "react-icons/io5";
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
      field: "_id",
      headerName: "Message",
      flex: 1,

    },
    {
      field: "name",
      headerName: "Group Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "builder",
      headerName: "Reported By",
      flex: 1,
    },
    {
      field: "projects",
      headerName: "Message By",
      flex: 1,
      valueGetter: (params) => params.value.join(","), 
    },

    {
      field: "createdAt",
      headerName: "ReportedAt",
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
            onClick={() => {
              // handleEdit(params.row._id)
              console.log("show rep msg")
            }}
            // color="primary"
            className="text-grey-400"
          >
            <IoEyeSharp />
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
    fetchAllCommunities(userId,userToken)
  }

  const FetchCommunity = async (id) => {
    // Make the DELETE request
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/communities/getCommunity/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          setEditData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchAllCommunities = (userId, userToken) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/communities/getAllCommunities?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteCommunityById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/communities/deleteCommunity/${id}?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          fetchAllCommunities(userId, userToken);
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
        fetchAllCommunities(decoded.userId, token);
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
    fetchAllCommunities(userId,userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    FetchCommunity(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteCommunityById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Reported Messages"
          subtitle={"See reported messages here"}
        />

        
      </Box>

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
      
    </Box>
  )
}

export default Index