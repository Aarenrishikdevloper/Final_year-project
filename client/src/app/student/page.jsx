// "use client";
// import Web3 from "web3";
// import { useState } from "react";
// import StudentContract from "../../../contracts/StudentContract.json";

// export default function StudentLogin() {
//   const [candidateId, setCandidateId] = useState("");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [verified, setVerified] = useState(false);

//   const web3 = new Web3(window.ethereum);
//   let studentContract;

//   const loadContract = async () => {
//     const networkId = await web3.eth.net.getId();
//     const studentData = StudentContract.networks[networkId];
//     studentContract = new web3.eth.Contract(
//       StudentContract.abi,
//       studentData.address
//     );
//   };

//   const sendOTP = async () => {
//     await loadContract();
//     const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpHash = web3.utils.soliditySha3(otpValue);

//     // Store OTP locally (not secure but frontend-only alternative)
//     sessionStorage.setItem("otp", otpValue);

//     const accounts = await web3.eth.getAccounts();
//     await studentContract.methods
//       .generateOTP(candidateId, otpHash)
//       .send({ from: accounts[0] });

//     setOtpSent(true);
//     alert("OTP generated! Enter it below.");
//   };

//   const verifyOTP = async () => {
//     await loadContract();
//     const storedOtp = sessionStorage.getItem("otp");
//     const isValid = await studentContract.methods
//       .verifyOTP(candidateId, storedOtp)
//       .call();

//     if (isValid) {
//       setVerified(true);
//       alert("OTP Verified! Fetching certificates...");
//     } else {
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center space-y-4">
//       <input
//         type="text"
//         placeholder="Enter Candidate ID"
//         value={candidateId}
//         onChange={(e) => setCandidateId(e.target.value)}
//         className="border p-2 rounded"
//       />
//       {!otpSent ? (
//         <button
//           onClick={sendOTP}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           Generate OTP
//         </button>
//       ) : (
//         <>
//           <input
//             type="text"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={verifyOTP}
//             className="bg-green-500 text-white p-2 rounded"
//           >
//             Verify OTP
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
