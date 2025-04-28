import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "../../../MyFunctions";

function WaitingListModal({ data, closeModal }) {
  return (
    <Dialog
      open={true}
      onClose={closeModal}
      fullWidth
      maxWidth="md"
      aria-labelledby="waiting-list-details-dialog"
    >
      <DialogTitle id="waiting-list-details-dialog">
        Waiting List Entry Details
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom component="div">
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" component="div">
              Full Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.fullName || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" component="div">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.email || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" component="div">
              Mobile
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.mobile || "N/A"}
            </Typography>
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>
              Location Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div">
              State
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.state || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div">
              City
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.city || "N/A"}
            </Typography>
          </Grid>

          {/* Property Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>
              Property Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" component="div">
              Builder
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.builder || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" component="div">
              Project
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.project || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" component="div">
              Tower
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.tower || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" component="div">
              Unit
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.unit || "N/A"}
            </Typography>
          </Grid>

          {/* Timestamp Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>
              Additional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div">
              Added On
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(data.createdAt) || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div">
              Last Updated
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(data.updatedAt) || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeModal} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WaitingListModal;