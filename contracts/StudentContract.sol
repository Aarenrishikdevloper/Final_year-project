// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract StudentContract {
    struct Student {
        string email;
        string candidateId;
        bytes32 otpHash;
    }

    mapping(string => Student) private students; // candidateId → Student struct

    event OTPGenerated(string candidateId, bytes32 otpHash);
    event OTPVerified(string candidateId);

    // Register a student
    function registerStudent(string memory _candidateId, string memory _email) public {
        require(bytes(students[_candidateId].email).length == 0, "Student already exists");
        students[_candidateId] = Student(_email, _candidateId, 0);
    }

    // Generate OTP (frontend must hash OTP before calling this)
    function generateOTP(string memory _candidateId, bytes32 _otpHash) public {
        require(bytes(students[_candidateId].email).length != 0, "Student not registered");
        students[_candidateId].otpHash = _otpHash;
        emit OTPGenerated(_candidateId, _otpHash);
    }

    // Verify OTP
    function verifyOTP(string memory _candidateId, string memory _otp) public view returns (bool) {
        require(bytes(students[_candidateId].email).length != 0, "Student not registered");
        return keccak256(abi.encodePacked(_otp)) == students[_candidateId].otpHash;
    }

    // Get Student Email
    function getStudentEmail(string memory _candidateId) public view returns (string memory) {
        require(bytes(students[_candidateId].email).length != 0, "Student not found");
        return students[_candidateId].email;
    }
}
