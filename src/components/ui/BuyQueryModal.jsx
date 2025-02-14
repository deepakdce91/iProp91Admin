import React from 'react';
import * as Dialog from '@radix-ui/react-dialog'; 
import { Calendar, X } from "lucide-react";
import { Box, IconButton, useTheme } from "@mui/material";

const ViewBuyQueryModal = ({ data, closeModal }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleClose = () => {
    closeModal(false);
  };

  return (
    <Dialog.Root open={true} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Box sx={{ position: 'fixed', inset: 0, zIndex: theme.zIndex.modal }}>
          <Dialog.Overlay 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }} 
          />
          <Dialog.Content 
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '85vh',
              width: '90vw',
              maxWidth: '28rem',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.paper,
              padding: theme.spacing(3),
              boxShadow: theme.shadows[5],
              border: `1px solid ${theme.palette.divider}`,
              zIndex: theme.zIndex.modal + 1,
            }}
            onEscapeKeyDown={handleClose}
            onInteractOutside={handleClose}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: theme.spacing(2),
              color: theme.palette.text.primary,
            }}>
              <Dialog.Title style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600,
              }}>
                Buy Query Details
              </Dialog.Title>
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <X size={20} />
              </IconButton>
            </div>
            
            <div style={{ 
              overflowY: 'auto', 
              maxHeight: '60vh',
              paddingRight: theme.spacing(1),
            }}>
              <div style={{ display: 'grid', gap: theme.spacing(2) }}>
                {[
                  { label: 'City', value: data.city },
                  { label: 'Office Location', value: data.officeLocation },
                  { label: 'School Location', value: data.kidsSchoolLocation },
                  { label: 'Medical Assistance', value: data.medicalAssistanceRequired },
                  { label: 'Budget', value: data.budget },
                  { label: 'Type', value: data.type },
                  { label: 'Status', value: data.constructionStatus }
                ].map((item, index) => (
                  <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr', 
                    alignItems: 'center',
                  }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                    }}>
                      {item.label}
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr', 
                  alignItems: 'center',
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                  }}>
                    Received
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Calendar size={16} />
                    {new Date(data.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'flex-end'
            }}>
              <Box
                component="button"
                onClick={handleClose}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  transition: 'background-color 200ms',
                }}
              >
                Close
              </Box>
            </Box>
          </Dialog.Content>
        </Box>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ViewBuyQueryModal;