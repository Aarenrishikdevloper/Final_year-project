"use client";

import { useEffect, useState } from "react";
import Web3 from "web3";
import StudentContract from "../../../../build/contracts/StudentContract.json";
import CertificationContract from "../../../../build/contracts/Certification.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "@/components/Navbar";
import CertificateCard from "@/components/CertificateCard";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState({
    web3: true,
    contract: true,
    data: false,
    registration: false,
    checkingRegistration: false,
  });
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState("");
  const [networkError, setNetworkError] = useState(false);
  const [renderMetaMaskError, setRenderMetaMaskError] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);

  const NETWORKS = {
    1: "Ethereum Mainnet",
    3: "Ropsten Testnet",
    4: "Rinkeby Testnet",
    5: "Goerli Testnet",
    1337: "Local Development",
    5777: "Local Development",
  };

  const handleError = (err) => {
    console.error(err);
    setError(err.message);
    setLoading({
      web3: false,
      contract: false,
      data: false,
      registration: false,
      checkingRegistration: false,
    });
    toast.error(`Error: ${err.message}`);
  };

  useEffect(() => {
    loadWeb3Metamask();
  }, []);

  const loadWeb3Metamask = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);
        setRenderMetaMaskError(false);
        setLoading((prev) => ({ ...prev, web3: false }));
        await initializeContract(web3Instance);
      } else if (window.web3) {
        const web3Instance = new Web3(window.web3.currentProvider);
        setWeb3(web3Instance);
        setRenderMetaMaskError(false);
        setLoading((prev) => ({ ...prev, web3: false }));
        await initializeContract(web3Instance);
      } else {
        toast.warning(
          "❕ Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
        setLoading((prev) => ({ ...prev, web3: false, contract: false }));
        setRenderMetaMaskError(true);
      }
    } catch (err) {
      console.error("Error initializing Web3:", err);
      handleError(err);
    }
  };

  const initializeContract = async (web3Instance) => {
    try {
      const networkId = await web3Instance.eth.net.getId();
      setNetworkName(NETWORKS[networkId] || `Unknown Network (${networkId})`);

      if (!StudentContract.networks[networkId]) {
        const errorMsg = `Contract not deployed to network ID ${networkId}. Available networks: ${Object.keys(
          StudentContract.networks
        ).join(", ")}`;
        setNetworkError(true);
        throw new Error(errorMsg);
      }

      const contractAddress = StudentContract.networks[networkId].address;
      const contractCode = await web3Instance.eth.getCode(contractAddress);

      if (contractCode === "0x") {
        throw new Error("No contract code at this address");
      }

      const contractInstance = new web3Instance.eth.Contract(
        StudentContract.abi,
        contractAddress
      );

      setContract(contractInstance);
      setLoading((prev) => ({ ...prev, contract: false }));

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Contract initialization error:", err);
      setLoading((prev) => ({ ...prev, contract: false }));
      handleError(err);
    }
  };

  const fetchCertificatesByEmail = async (studentEmail) => {
    if (!studentEmail || !web3) {
      console.log("Skipping fetch - missing email or web3 instance");
      return;
    }

    try {
      setLoadingCertificates(true);
      console.log(`Starting certificate fetch for: ${studentEmail}`);

      // Get network and contract info
      const networkId = await web3.eth.net.getId();
      const certificationAddress =
        CertificationContract.networks[networkId]?.address;

      if (!certificationAddress) {
        throw new Error(
          `Certification contract not deployed on network ${networkId}`
        );
      }

      // Create contract instance
      const certificationContract = new web3.eth.Contract(
        CertificationContract.abi,
        certificationAddress
      );

      // First try to get certificate IDs by email
      const result = await certificationContract.methods
        .getCertificatesByEmail(studentEmail)
        .call();

      console.log("Raw contract response:", result);

      // Handle different response formats
      let certificateIds = [];
      if (Array.isArray(result)) {
        // If it's an array of IDs
        if (
          result.length > 0 &&
          typeof result[0] === "string" &&
          result[0].startsWith("0x")
        ) {
          certificateIds = result;
        }
        // If it's the structured response [ids, names, courses, dates, statuses]
        else if (result.length >= 1 && Array.isArray(result[0])) {
          certificateIds = result[0]; // First element is the IDs array
        }
      } else if (typeof result === "object" && result.ids) {
        // If it's an object with an ids property
        certificateIds = result.ids;
      }

      console.log("Certificate IDs:", certificateIds);

      if (!Array.isArray(certificateIds)) {
        throw new Error(
          "Could not parse certificate IDs from contract response"
        );
      }

      // Then fetch full details for each certificate
      const certs = await Promise.all(
        certificateIds.map(async (id) => {
          try {
            const fullData = await certificationContract.methods
              .getData(id)
              .call();

            return {
              id: id,
              candidate_name: fullData[0] || "Not available",
              candidate_email: studentEmail,
              candidate_id: fullData[2] || "Not available",
              course_name: fullData[3] || "Not available",
              creation_date: fullData[4] || "Not available",
              institute_name: fullData[5] || "Not available",
              institute_acronym: fullData[6] || "Not available",
              institute_link: fullData[7] || "Not available",
              governmentId: fullData[8] || "Not available",
              revoked: fullData[9] || false,
            };
          } catch (e) {
            console.error(`Error fetching certificate ${id}:`, e);
            return null;
          }
        })
      );

      // Filter out any null entries
      const validCerts = certs.filter((cert) => cert !== null);
      console.log("Fetched certificates:", validCerts);
      setCertificates(validCerts);
    } catch (err) {
      console.error("Certificate fetch error:", err);
      toast.error(`Failed to load certificates: ${err.message}`);

      // Fallback to event-based approach if direct method fails
      try {
        console.log("Attempting fallback to event-based approach");
        const fallbackCerts = await fetchCertificatesViaEvents(
          CertificationContract,
          studentEmail
        );
        setCertificates(fallbackCerts);
      } catch (fallbackError) {
        console.error("Fallback approach failed:", fallbackError);
        toast.error("Could not load certificates using any method");
      }
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Fallback event-based fetcher
  async function fetchCertificatesViaEvents(contract, email) {
    try {
      const events = await contract.getPastEvents("CertificateGenerated", {
        filter: { candidate_email: [email.toLowerCase()] },
        fromBlock: 0,
        toBlock: "latest",
      });

      return await Promise.all(
        events.map(async (event) => {
          try {
            const data = await contract.methods
              .getData(event.returnValues.certificateId)
              .call();

            return {
              id: event.returnValues.certificateId,
              candidate_name: data[0] || "Not available",
              candidate_email: email,
              candidate_id: data[2] || "Not available",
              course_name: data[3] || "Not available",
              creation_date: data[4] || "Not available",
              institute_name: data[5] || "Not available",
              institute_acronym: data[6] || "Not available",
              institute_link: data[7] || "Not available",
              governmentId: data[8] || "Not available",
              revoked: data[9] || false,
            };
          } catch (e) {
            console.error("Error processing event:", e);
            return null;
          }
        })
      ).then((results) => results.filter(Boolean));
    } catch (err) {
      console.error("Event fetch failed:", err);
      return [];
    }
  }

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const checkRegistration = async () => {
    if (!contract || !account) return;

    try {
      setLoading((prev) => ({ ...prev, checkingRegistration: true }));
      const result = await contract.methods
        .getStudent(account)
        .call({ from: account, gas: 300000 });

      if (
        result &&
        result[0] !== "0x0000000000000000000000000000000000000000"
      ) {
        setStudent({
          wallet: result[0],
          email: result[1],
        });
        // Fetch certificates after we have the student email
        await fetchCertificatesByEmail(result[1]);
      }
    } catch (err) {
      console.log("Registration check:", err.message);
    } finally {
      setLoading((prev) => ({ ...prev, checkingRegistration: false }));
      setHasCheckedRegistration(true);
    }
  };

  useEffect(() => {
    if (account && contract && !hasCheckedRegistration) {
      checkRegistration();
    }
  }, [account, contract, hasCheckedRegistration]);

  const registerStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading((prev) => ({ ...prev, registration: true }));

      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      const gasEstimate = await contract.methods
        .registerStudent(email)
        .estimateGas({ from: account });

      const gasWithBuffer = (BigInt(gasEstimate) * 120n) / 100n;

      const receipt = await contract.methods.registerStudent(email).send({
        from: account,
        gas: gasWithBuffer.toString(),
      });

      if (receipt.status) {
        await checkRegistration();
        toast.success("✅ Successfully registered as student!");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = err.message;
      if (err.code === -32603)
        errorMessage = "Transaction failed. Check console for details.";
      if (err.code === 4001) errorMessage = "Transaction rejected by user";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, registration: false }));
    }
  };

  // Render loading states
  if (loading.web3 || loading.contract) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h1>Loading</h1>
          <p>Initializing blockchain connection...</p>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (renderMetaMaskError) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h1>MetaMask Required</h1>
          <p>
            You are not using an Ethereum-based browser. Please install
            MetaMask.
          </p>
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Install MetaMask
          </a>
        </div>
      </>
    );
  }

  if (networkError) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h1>Network Error</h1>
          <p>Please connect to the correct Ethereum network.</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="container error">
          <h1>Error</h1>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h1>Student Profile</h1>
          <div className="network-indicator">
            <span>Network: </span>
            <strong>{networkName}</strong>
          </div>
          <button
            onClick={connectWallet}
            disabled={loading.data}
            className="connect-button"
          >
            {loading.data ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <h1>Student Profile</h1>
        <div className="network-indicator">
          <span>Network: </span>
          <strong>{networkName}</strong>
        </div>
        <p className="wallet-address">Connected Wallet: {account}</p>

        {loading.checkingRegistration ? (
          <div className="spinner"></div>
        ) : student ? (
          <>
            <div className="profile">
              <h2>Student Details</h2>
              <p>
                <strong>Wallet Address:</strong> {student.wallet}
              </p>
              <p>
                <strong>Email:</strong> {student.email}
              </p>
            </div>

            <div className="certificates-section">
              <h2>My Certificates</h2>
              {loadingCertificates ? (
                <div className="spinner"></div>
              ) : certificates.length > 0 ? (
                <div className="certificates-grid">
                  {certificates.map((cert) => (
                    <CertificateCard
                      key={cert.id}
                      certificate={cert}
                      id={cert.id}
                    />
                  ))}
                </div>
              ) : (
                <p>No certificates found</p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={registerStudent} className="registration-form">
            <h2>Register as Student</h2>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading.registration}
              />
            </div>
            <button
              type="submit"
              disabled={loading.registration}
              className="submit-button"
            >
              {loading.registration ? "Registering..." : "Register"}
            </button>
          </form>
        )}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}
