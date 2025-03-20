var Certification = artifacts.require("./Certification.sol");
var Institution = artifacts.require("./Institution.sol");

module.exports = async function (deployer) {
  // Deploy Institution Contract
  await deployer.deploy(Institution);
  const institution = await Institution.deployed();

  // Deploy Certification Contract
  await deployer.deploy(Certification, institution.address);
  const certification = await Certification.deployed();

  console.log("Institution deployed at:", institution.address);
  console.log("Certification deployed at:", certification.address);
};
