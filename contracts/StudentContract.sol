// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract StudentContract {
    struct Student {
        address wallet;
        string email;
    }

    mapping(address => Student) private students; // wallet → Student struct
    mapping(string => address) private emailToWallet; // email → wallet

    event StudentRegistered(address wallet, string email);

    // Student self-registration
    function registerStudent(string memory _email) public {
        require(
            students[msg.sender].wallet == address(0),
            "Student already registered"
        );
        require(
            emailToWallet[_email] == address(0),
            "Email already registered"
        );

        // Store student details
        students[msg.sender] = Student(msg.sender, _email);
        emailToWallet[_email] = msg.sender;

        emit StudentRegistered(msg.sender, _email);
    }

    // Fetch student details using wallet address
    function getStudent(
        address _wallet
    ) public view returns (address, string memory) {
        require(
            students[_wallet].wallet != address(0),
            "Student not registered"
        );
        return (students[_wallet].wallet, students[_wallet].email);
    }

    // Fetch wallet address using email
    function getWalletByEmail(
        string memory _email
    ) public view returns (address) {
        require(emailToWallet[_email] != address(0), "Email not registered");
        return emailToWallet[_email];
    }

    // Check if wallet is registered
    function isRegistered(address _wallet) public view returns (bool) {
        return students[_wallet].wallet != address(0);
    }
}
