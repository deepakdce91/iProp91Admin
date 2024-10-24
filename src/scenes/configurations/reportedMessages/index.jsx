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

import { FaRegCircleDot } from "react-icons/fa6";

import DisplayReportedMessagesModal from "../../../components/ui/DisplayReportedMessageModal";


function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [data, setData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState();

  const columns = [
    {
      field: "reportedBy",
      headerName: "Reported By",
      flex: 1,
    },
    {
      field: "groupName",
      headerName: "Group Name",
      flex: 1,
      cellClassName: "name-column--cell",

    },
    {
      field: "message",
      headerName: "Message",
      flex: 2,
    },
    {
      field: "messageBy",
      headerName: "Message By",
      flex: 1,
    },
    
    {
      field: "createdAt",
      headerName: "ReportedAt",
      flex: 1,
      valueGetter: (params) => formatDate(params.value), 
    },
   

{
      field: "actionTaken",
      headerName: "Action Taken",
      flex: 1,
      align: "center",
      renderCell: (params) => (
        <Box>
          <IconButton
          >
             <FaRegCircleDot className={`${params.value === "true" ? "text-green-500" : "text-red-500"} h-4 w-4`}  />
          </IconButton>
        </Box>
      ),
    },
   

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              setModalData(params.row)
              setShowModal(true)
            }}
            className="text-grey-400"
          >
            <IoEyeSharp />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id,params.row.groupId, params.row.messageId,)}
            // color="secondary"
          >
            <DeleteIcon  className="hover:text-red-400"/>
          </IconButton>
        </Box>
      ),
    },
  ];


  const fetchAllReportedMessages = (userId, userToken) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/reportedMessages/fetchAllReportedMessages?userId=${userId}`, {
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

  const deleteReportedMessageById = async (id, communityId, messageId) => {
    // Make the DELETE request
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/reportedMessages/deleteReportedMessage/${id}?userId=${userId}&communityId=${communityId}&messageId=${messageId}`,
        {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        if (response) {
          fetchAllReportedMessages(userId, userToken);
          toast.success("Reported Message deleted!");
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
        fetchAllReportedMessages(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);


  const closeModal = () => {
    setShowModal(false)
    setModalData();
    fetchAllReportedMessages(userId,userToken);
  };


  // Click handler for the delete button
  const handleDelete = (id, communityId, messageId) => {
    deleteReportedMessageById(id, communityId, messageId);
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
         {data && <DataGrid
            rows={data}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row._id}
            autoHeight
          />}
        </Box>
      {showModal === true && modalData && <DisplayReportedMessagesModal closeModal={closeModal} data={modalData} userToken = {userToken} userId={userId} />}
    </Box>
  )
}

export default Index