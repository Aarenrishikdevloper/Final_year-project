import Link from "next/link";

export default function CertificateCard({ certificate }) {
  return (
    <Link href={`/certificate/${certificate.id}`} passHref>
      <div className="certificate-card">
        <h3>{certificate.course_name}</h3>
        <div className="certificate-details">
          <p>
            <strong>Student:</strong> {certificate.candidate_name}
          </p>
          <p>
            <strong>Student ID:</strong> {certificate.candidate_id}
          </p>
          <p>
            <strong>Issued by:</strong> {certificate.institute_name}
          </p>
          <p>
            <strong>Date:</strong> {certificate.creation_date}
          </p>
          {certificate.revoked ? (
            <span className="revoked-badge">REVOKED</span>
          ) : (
            <span className="valid-badge">VALID</span>
          )}
        </div>
      </div>
    </Link>
  );
}
