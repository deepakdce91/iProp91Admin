import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ViewBuyQueryModal = ({ data, closeModal }) => {
  return (
    <Modal open={true} onClose={closeModal}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Buy Query Details
        </Typography>
        <Typography variant="body1">
          <strong>City:</strong> {data.city}
        </Typography>
        <Typography variant="body1">
          <strong>Office Location:</strong> {data.officeLocation}
        </Typography>
        <Typography variant="body1">
          <strong>Kids School Location:</strong> {data.kidsSchoolLocation}
        </Typography>
        <Typography variant="body1">
          <strong>Medical Assistance Required:</strong> {data.medicalAssistanceRequired}
        </Typography>
        <Typography variant="body1">
          <strong>Budget:</strong> {data.budget}
        </Typography>
        <Typography variant="body1">
          <strong>Type:</strong> {data.type}
        </Typography>
        <Typography variant="body1">
          <strong>Construction Status:</strong> {data.constructionStatus}
        </Typography>
        <Typography variant="body1">
          <strong>Received at:</strong> {new Date(data.createdAt).toLocaleString()}
        </Typography>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={closeModal}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewBuyQueryModal;