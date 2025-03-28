import { decrypt } from "@/utils/decrypt";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  styled,
} from "@mui/material";

const CertificateCardContainer = styled(Card)(({ theme }) => ({
  display: "inline-block",
  maxWidth: 400,
  textDecoration: "none",
  width: "100%",
  cursor: "pointer",
  borderRadius: "12px",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
  border: `1px solid ${theme.palette.grey[300]}`,
  boxShadow: theme.shadows[2],
  background:
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : "linear-gradient(124deg, rgb(129, 255, 228) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
  color: "white",
}));

const StatusBadge = styled(Chip)(({ theme, revoked }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: revoked
    ? theme.palette.error.main
    : theme.palette.success.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

export default function CertificateCard({ certificate }) {
  const encryptionKey = "your-secret-key";
  const encryptedDate = certificate.creation_date;
  const decryptedDate = decrypt(encryptedDate, encryptionKey);

  //debugging steps
  console.log("Decrypted Date:", decryptedDate);

  const timestamp = Number(decryptedDate);
  const date = new Date(timestamp);
  const formattedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  //debugging steps
  console.log("Formatted Date:", formattedDate);

  return (
    // <Link href={`/certificate/${certificate.id}`} passHref>
    <Box display={"flex"} justifyContent={"center"}>
      <CertificateCardContainer
        component="a"
        onClick={() => {
          window.open(
            `${window.location.href.slice(
              0,
              -window.location.pathname.length
            )}/certificate/${certificate.id}`
          );
        }}
      >
        <CardContent>
          <Box position="relative">
            {certificate.revoked ? (
              <StatusBadge label="REVOKED" revoked />
            ) : (
              <StatusBadge label="VALID" revoked={false} />
            )}
          </Box>

          <Typography variant="h5" component="h3" gutterBottom>
            {certificate.course_name}
          </Typography>

          <Box mt={2}>
            <Typography variant="body1" paragraph>
              <Typography component="span" fontWeight="bold">
                Student:
              </Typography>{" "}
              {certificate.candidate_name}
            </Typography>
            <Typography variant="body1" paragraph>
              <Typography component="span" fontWeight="bold">
                Student ID:
              </Typography>{" "}
              {certificate.candidate_id}
            </Typography>
            <Typography variant="body1" paragraph>
              <Typography component="span" fontWeight="bold">
                Issued by:
              </Typography>{" "}
              {certificate.institute_name}
            </Typography>
            <Typography variant="body1" paragraph>
              <Typography component="span" fontWeight="bold">
                Date:
              </Typography>{" "}
              {formattedDate}
            </Typography>
          </Box>
        </CardContent>
      </CertificateCardContainer>
    </Box>
    // </Link>
  );
}
