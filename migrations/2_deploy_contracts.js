var Certification = artifacts.require("./Certification.sol");
var Institution = artifacts.require("./Institution.sol");
var StudentContract = artifacts.require("./StudentContract.sol");

module.exports = async function (deployer) {
  // Deploy Institution Contract
  await deployer.deploy(Institution);
  const institution = await Institution.deployed();

  // Deploy Certification Contract
  await deployer.deploy(Certification, institution.address);
  const certification = await Certification.deployed();

  //deploy StudentCntract
  await deployer.deploy(StudentContract);
  const studentContract = await StudentContract.deployed();
  // const StudentContract = await StudentContract.deployed();

  console.log("Institution deployed at:", institution.address);
  console.log("Certification deployed at:", certification.address);
  console.log("Student Contract deployed at: ", studentContract.address);
};
