import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface TermsAndConditionsDialogProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const termsText = `Terms and conditions outline what users can and cannot do with your website, products, and services. They lay out the rules to protect you in case of misuse and enable you to take action if it becomes necessary.\nIt's also referred to by other names such as terms of service (ToS) and terms of use (ToU). Even though they have different names, in fact – there is no difference.\nIn order to use your website, products, or services, your customers usually must agree to abide by your terms and conditions first.`;

const TermsAndConditionsDialog: React.FC<TermsAndConditionsDialogProps> = ({
  open,
  onClose,
  onAgree,
}) => {
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    setChecked(false);
    onAgree();
  };

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 0, bgcolor: "#fff" } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: 28,
          color: "#222",
          pb: 1.5,
          pt: 3,
          px: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Terms and Conditions
        <IconButton onClick={handleClose} sx={{ color: "#222" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ mb: 0 }} />
      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        <Typography
          sx={{
            color: "#222",
            fontSize: 16,
            fontWeight: 400,
            mb: 3,
            whiteSpace: "pre-line",
            lineHeight: 1.5,
            textAlign: "justify",
            hyphens: "auto",
            wordBreak: "break-word",
          }}
        >
          {termsText}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              sx={{ p: 0.5, mr: 1 }}
            />
          }
          label={
            <Typography sx={{ fontSize: 16, color: "#222", fontWeight: 400 }}>
              I have read and agree to these Terms and Conditions
            </Typography>
          }
          sx={{
            alignItems: "flex-start",
            ".MuiFormControlLabel-label": { mt: 0.2 },
          }}
        />
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          bgcolor: "#f9f9f9",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Button
          variant="contained"
          disabled={!checked}
          onClick={handleClose}
          sx={{
            bgcolor: "#e0e0e0",
            color: "#bdbdbd",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 2,
            px: 4,
            py: 1.2,
            boxShadow: "none",
            textTransform: "none",
            mr: 2,
            "&:hover": { bgcolor: "#e0e0e0" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!checked}
          onClick={handleAgree}
          sx={{
            bgcolor: checked ? "#526794" : "#e0e0e0",
            color: checked ? "#fff" : "#bdbdbd",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 2,
            px: 4,
            py: 1.2,
            boxShadow: "none",
            textTransform: "none",
            "&:hover": { bgcolor: checked ? "#526794" : "#e0e0e0" },
          }}
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditionsDialog;
