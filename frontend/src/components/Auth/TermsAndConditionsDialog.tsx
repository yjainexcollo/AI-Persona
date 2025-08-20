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

const termsSections: Array<{ title: string; body: string }> = [
  {
    title: "Overview",
    body: 'These Terms and Conditions ("Terms") govern your access to and use of our website, products, and services (collectively, the "Services"). By using the Services, you agree to these Terms. If you do not agree, do not use the Services.',
  },
  {
    title: "Acceptance of Terms",
    body: "By creating an account or accessing the Services, you confirm that you are at least the age of majority in your jurisdiction and that you have the authority to enter into these Terms.",
  },
  {
    title: "Accounts & Security",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "Permitted Use",
    body: "You may use the Services for lawful, personal, or internal business purposes in compliance with these Terms and applicable laws.",
  },
  {
    title: "Prohibited Conduct",
    body: "Do not: (1) reverse engineer or interfere with the Services; (2) upload malicious code or content; (3) infringe on intellectual property or privacy rights; (4) misuse, overload, or attempt to gain unauthorized access to the Services.",
  },
  {
    title: "Intellectual Property",
    body: "All content, features, and functionality in the Services are owned by us or our licensors and are protected by intellectual property laws. Your use grants you a limited, non-exclusive, non-transferable license.",
  },
  {
    title: "Privacy",
    body: "Your use of the Services is also governed by our Privacy Policy. By using the Services, you consent to our data practices described there.",
  },
  {
    title: "Termination",
    body: "We may suspend or terminate your access to the Services at any time for any conduct that violates these Terms or harms other users or the Services.",
  },
  {
    title: "Disclaimers & Liability",
    body: 'The Services are provided "as is" and "as available." We disclaim all warranties to the maximum extent permitted by law. To the fullest extent allowed, we are not liable for any indirect, incidental, or consequential damages.',
  },
  {
    title: "Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of the Services after changes take effect indicates acceptance of the revised Terms.",
  },
  {
    title: "Contact",
    body: "If you have questions about these Terms, please contact support.",
  },
];

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
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        Terms and Conditions
        <IconButton onClick={handleClose} sx={{ color: "#222" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ mb: 0 }} />
      <DialogContent sx={{ px: 4, pt: 3, pb: 1 }}>
        {termsSections.map((section) => (
          <React.Fragment key={section.title}>
            <Typography
              sx={{
                color: "#222",
                fontSize: 14,
                fontWeight: 700,
                mb: 0.75,
                lineHeight: 1.4,
                textAlign: "left",
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {section.title}
            </Typography>
            <Typography
              sx={{
                color: "#222",
                fontSize: 14,
                fontWeight: 400,
                mb: 2,
                whiteSpace: "pre-line",
                lineHeight: 1.55,
                textAlign: "left",
                hyphens: "auto",
                wordBreak: "break-word",
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {section.body}
            </Typography>
          </React.Fragment>
        ))}
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              sx={{ p: 0.5, ml: 0.5, mt: -0.3 }}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 16,
                color: "#222",
                fontWeight: 400,
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
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
