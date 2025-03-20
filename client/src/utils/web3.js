import Web3 from "web3";
import instituteABI from "../../../build/contracts/Institution.json";
import certificateABI from "../../../build/contracts/Certification.json";

const INSTITUTION_CONTRACT_ADDRESS =
  "0x101eF4C6Cf350Ef65c79a542413d982Af359672b";
const CERTIFICATION_CONTRACT_ADDRESS =
  "0x81057b5146f6669aEb19F370d5b109E78e6df87d";

let web3, institutionContract, certificationContract;

if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(() => {
      web3 = new Web3(window.ethereum);
      institutionContract = new web3.eth.Contract(
        instituteABI.abi,
        INSTITUTION_CONTRACT_ADDRESS
      );
      certificationContract = new web3.eth.Contract(
        certificateABI.abi,
        CERTIFICATION_CONTRACT_ADDRESS
      );
    })
    .catch((err) => console.error("MetaMask connection error:", err));
} else {
  console.warn("MetaMask not detected.");
  web3 = null;
  institutionContract = null;
  certificationContract = null;
}

export { web3, institutionContract, certificationContract };
