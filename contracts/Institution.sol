// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Certification.sol";

contract Institution {
    // State Variables
    address public owner;

    // Mappings
    mapping(address => Institute) private institutes; // Maps account to their institute
    mapping(address => Course[]) private instituteCourses; // Maps account to their courses
    mapping(string => bool) private normalizedNames; // Tracks normalized institute names
    mapping(string => bool) private normalizedAcronyms; // Tracks normalized institute acronyms
    mapping(string => bool) private governmentIds; // Tracks used government IDs

    // Approved Institutes Registry
    struct ApprovedInstitute {
        string name;
        string acronym;
        string normalizedName;
        string normalizedAcronym;
        string governmentId; // New field: Government-issued ID
    }
    ApprovedInstitute[] public approvedInstitutes;

    // Events
    event instituteAdded(string _instituteName);
    event instituteApproved(string _instituteName);

    constructor() {
        owner = msg.sender;
    }

    struct Course {
        string course_name;
        // Other attributes can be added
    }

    struct Institute {
        string institute_name;
        string institute_acronym;
        string institute_link;
        string governmentId; // New field: Government-issued ID
    }

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Normalize a string (convert to lowercase and remove spaces)
    function normalizeString(
        string memory _str
    ) private pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        bytes memory normalizedBytes = new bytes(strBytes.length);
        uint256 count = 0;

        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] != " ") {
                normalizedBytes[count] = toLower(strBytes[i]);
                count++;
            }
        }

        // Resize the array to remove empty slots
        bytes memory result = new bytes(count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = normalizedBytes[i];
        }

        return string(result);
    }

    // Convert a single character to lowercase
    function toLower(bytes1 _char) private pure returns (bytes1) {
        if (_char >= 0x41 && _char <= 0x5A) {
            return _char | 0x20;
        }
        return _char;
    }

    // Add and approve an institute in one function (only owner)
    function addInstitute(
        address _address,
        string memory _institute_name,
        string memory _institute_acronym,
        string memory _institute_link,
        string memory _governmentId, // New parameter: Government ID
        Course[] memory _institute_courses
    ) public onlyOwner returns (bool) {
        // Ensure the account has not already added an institute
        require(
            bytes(institutes[_address].institute_name).length == 0,
            "This account has already added an institute"
        );

        // Ensure the government ID is unique
        require(
            !governmentIds[_governmentId],
            "An institute with this government ID already exists"
        );

        // Normalize the institute name and acronym
        string memory normalizedName = normalizeString(_institute_name);
        string memory normalizedAcronym = normalizeString(_institute_acronym);

        // Ensure the institute is not already approved
        require(
            !normalizedNames[normalizedName],
            "An institute with a similar name already exists"
        );
        require(
            !normalizedAcronyms[normalizedAcronym],
            "An institute with a similar acronym already exists"
        );

        // Add the institute to the approved registry
        approvedInstitutes.push(
            ApprovedInstitute({
                name: _institute_name,
                acronym: _institute_acronym,
                normalizedName: normalizedName,
                normalizedAcronym: normalizedAcronym,
                governmentId: _governmentId // Include governmentId
            })
        );

        // Mark the normalized name, acronym, and government ID as used
        normalizedNames[normalizedName] = true;
        normalizedAcronyms[normalizedAcronym] = true;
        governmentIds[_governmentId] = true;

        // Add the institute to the blockchain
        institutes[_address] = Institute(
            _institute_name,
            _institute_acronym,
            _institute_link,
            _governmentId // Include governmentId
        );

        // Add the courses
        for (uint256 i = 0; i < _institute_courses.length; i++) {
            instituteCourses[_address].push(_institute_courses[i]);
        }

        // Emit the events
        emit instituteApproved(_institute_name);
        emit instituteAdded(_institute_name);

        return true;
    }

    // Get the list of approved institutes
    function getApprovedInstitutes()
        public
        view
        returns (ApprovedInstitute[] memory)
    {
        return approvedInstitutes;
    }

    // Called by Institutions
    function getInstituteData()
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory, // New return value: governmentId
            Course[] memory
        )
    {
        Institute memory temp = institutes[msg.sender];
        bytes memory tempEmptyStringNameTest = bytes(temp.institute_name);
        require(
            tempEmptyStringNameTest.length > 0,
            "Institute account does not exist!"
        );

        // Copy the storage array into a memory array
        Course[] memory courses = new Course[](
            instituteCourses[msg.sender].length
        );
        for (uint256 i = 0; i < instituteCourses[msg.sender].length; i++) {
            courses[i] = instituteCourses[msg.sender][i];
        }

        return (
            temp.institute_name,
            temp.institute_acronym,
            temp.institute_link,
            temp.governmentId, // Return governmentId
            courses
        );
    }

    // Called by Smart Contracts
    function getInstituteData(
        address _address
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory, // New return value: governmentId
            Course[] memory
        )
    {
        require(
            Certification(msg.sender).owner() == owner,
            "Incorrect smart contract & authorizations!"
        );
        Institute memory temp = institutes[_address];
        bytes memory tempEmptyStringNameTest = bytes(temp.institute_name);
        require(
            tempEmptyStringNameTest.length > 0,
            "Institute does not exist!"
        );

        // Copy the storage array into a memory array
        Course[] memory courses = new Course[](
            instituteCourses[_address].length
        );
        for (uint256 i = 0; i < instituteCourses[_address].length; i++) {
            courses[i] = instituteCourses[_address][i];
        }

        return (
            temp.institute_name,
            temp.institute_acronym,
            temp.institute_link,
            temp.governmentId, // Return governmentId
            courses
        );
    }

    function checkInstitutePermission(
        address _address
    ) public view returns (bool) {
        Institute memory temp = institutes[_address];
        bytes memory tempEmptyStringNameTest = bytes(temp.institute_name);
        if (tempEmptyStringNameTest.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}
