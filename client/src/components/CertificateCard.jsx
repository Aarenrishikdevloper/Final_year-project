import { decrypt } from "@/utils/decrypt";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  styled,
  Grid,
  Avatar,
} from "@mui/material";

const CertificateCardContainer = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "100%",
  cursor: "pointer",
  borderRadius: "16px",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  border: "none",
  boxShadow: theme.shadows[4],
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
  color: theme.palette.mode === "dark" ? "#fff" : "#333",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "6px",
    height: "100%",
    background: "linear-gradient(to bottom,rgb(0, 219, 215), rgb(38, 38, 38),rgb(0, 118, 157))",
  },
}));

const StatusBadge = styled(Chip)(({ theme, revoked }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: revoked ? "#ff4757" : "#2ed573",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "12px",
  padding: theme.spacing(0.5),
  fontSize: "0.75rem",
  boxShadow: theme.shadows[1],
}));

const InstituteAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  marginBottom: theme.spacing(2),
  border: "2px solid #fff",
  boxShadow: theme.shadows[2],
  fontSize: "1.5rem",
}));

export default function CertificateCard({ certificate }) {
  const encryptionKey = "your-secret-key";
  const encryptedDate = certificate.creation_date;
  const decryptedDate = decrypt(encryptedDate, encryptionKey);

  const timestamp = Number(decryptedDate);
  const date = new Date(timestamp);
  const formattedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Grid item>
      <CertificateCardContainer
        onClick={() => {
          window.open(
            `${window.location.href.slice(
              0,
              -window.location.pathname.length
            )}/certificate/${certificate.id}`
          );
        }}
      >
        <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box position="relative">
            {certificate.revoked ? (
              <StatusBadge label="REVOKED" revoked />
            ) : (
              <StatusBadge label="VALID" revoked={false} />
            )}
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <InstituteAvatar sx={{ bgcolor: "#00b4db" }}>
              {getInitials(certificate.institute_name)}
            </InstituteAvatar>
            <Box ml={2}>
              <Typography
                variant="h6"
                component="h3"
                fontWeight="bold"
                sx={{ lineHeight: 1.2 }}
              >
                {certificate.course_name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {certificate.institute_name}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: "rgba(0, 180, 219, 0.1)",
              p: 2,
              borderRadius: "8px",
              mb: 2,
            }}
          >
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              Student Details
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">
                    Name:
                  </Box>{" "}
                  {certificate.candidate_name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">
                    ID:
                  </Box>{" "}
                  {certificate.candidate_id}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">
                    Issued:
                  </Box>{" "}
                  {formattedDate}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Click to view details
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              #{certificate.id.slice(0, 6)}...
            </Typography>
          </Box>
        </CardContent>
      </CertificateCardContainer>
    </Grid>
  );
}
