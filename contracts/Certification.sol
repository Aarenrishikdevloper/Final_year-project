// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Institution.sol";

contract Certification {
    // State Variables
    address public owner;
    Institution public institution;

    // Mappings
    mapping(bytes32 => Certificate) private certificates;

    // Events
    event CertificateGenerated(bytes32 certificateId);
    event CertificateRevoked(bytes32 certificateId);

    constructor(Institution _institution) {
        owner = msg.sender;
        institution = _institution;
    }

    struct Certificate {
        // Individual Info
        string candidate_name;
        string course_name;
        string creation_date;
        // Institute Info
        string institute_name;
        string institute_acronym;
        string institute_link;
        // Revocation status
        bool revoked;
    }

    function generateCertificate(
        string memory _candidate_name,
        uint256 _course_index,
        string memory _creation_date
    ) public {
        require(
            institution.checkInstitutePermission(msg.sender) == true,
            "Institute account does not exist"
        );

        // Generate unique ID
        bytes32 certificateId = keccak256(
            abi.encodePacked(
                _candidate_name,
                _course_index,
                _creation_date,
                msg.sender
            )
        );

        // Ensure the certificate does not already exist
        require(
            bytes(certificates[certificateId].creation_date).length == 0,
            "Certificate already exists"
        );

        // Fetch institute details
        (
            string memory _institute_name,
            string memory _institute_acronym,
            string memory _institute_link,
            Institution.Course[] memory _institute_courses
        ) = institution.getInstituteData(msg.sender);

        require(
            _course_index < _institute_courses.length,
            "Invalid Course index"
        );

        // Store certificate data
        certificates[certificateId] = Certificate(
            _candidate_name,
            _institute_courses[_course_index].course_name,
            _creation_date,
            _institute_name,
            _institute_acronym,
            _institute_link,
            false // Not revoked
        );

        emit CertificateGenerated(certificateId);
    }

    function getCertificateId(
        string memory _candidate_name,
        uint256 _course_index,
        string memory _creation_date,
        address _issuer
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _candidate_name,
                    _course_index,
                    _creation_date,
                    _issuer
                )
            );
    }

    function getData(
        bytes32 certificateId
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            bool
        )
    {
        Certificate memory temp = certificates[certificateId];

        require(
            bytes(temp.creation_date).length != 0,
            "Certificate does not exist"
        );

        return (
            temp.candidate_name,
            temp.course_name,
            temp.creation_date,
            temp.institute_name,
            temp.institute_acronym,
            temp.institute_link,
            temp.revoked
        );
    }

    function revokeCertificate(bytes32 certificateId) public {
        require(
            institution.checkInstitutePermission(msg.sender) == true,
            "Institute account does not exist"
        );

        require(
            bytes(certificates[certificateId].creation_date).length != 0,
            "Certificate does not exist"
        );

        certificates[certificateId].revoked = true;
        emit CertificateRevoked(certificateId);
    }
}
