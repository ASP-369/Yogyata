import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Contract ABI
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "address[]", name: "approvers", type: "address[]" },
      { indexed: false, internalType: "string", name: "dataHash", type: "string" },
    ],
    name: "CredentialFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "string", name: "dataHash", type: "string" },
    ],
    name: "CredentialIssued",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "depositStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address[]", name: "approvers", type: "address[]" },
      { internalType: "address[]", name: "toReward", type: "address[]" },
      { internalType: "address[]", name: "toSlash", type: "address[]" },
    ],
    name: "finalizeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "dataHash", type: "string" }],
    name: "issueCredential",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "uint256", name: "rep", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "stake", type: "uint256" },
    ],
    name: "IssuerRegistered",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "uint256", name: "initialRep", type: "uint256" },
      { internalType: "uint256", name: "initialStake", type: "uint256" },
    ],
    name: "registerIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "verifier", type: "address" },
      { internalType: "uint256", name: "initialRep", type: "uint256" },
      { internalType: "uint256", name: "initialStake", type: "uint256" },
    ],
    name: "registerVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "account", type: "address" },
      { indexed: false, internalType: "uint256", name: "oldRep", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newRep", type: "uint256" },
    ],
    name: "ReputationUpdated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "validator", type: "address" },
      { internalType: "uint256", name: "newRep", type: "uint256" },
    ],
    name: "slashValidator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "account", type: "address" },
      { indexed: false, internalType: "uint256", name: "oldStake", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newStake", type: "uint256" },
    ],
    name: "StakeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "verifier", type: "address" },
      { indexed: false, internalType: "uint256", name: "rep", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "stake", type: "uint256" },
    ],
    name: "VerifierRegistered",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "credentialId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "credentials",
    outputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "bool", name: "finalized", type: "bool" },
      { internalType: "string", name: "dataHash", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "validator", type: "address" }],
    name: "effectivePower",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "validator", type: "address" }],
    name: "getValidatorInfo",
    outputs: [
      { internalType: "uint256", name: "rep", type: "uint256" },
      { internalType: "uint256", name: "st", type: "uint256" },
      { internalType: "uint256", name: "vp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "isFinalized",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isIssuer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ISSUER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isVerifier",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "reputation",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "stake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalVP",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "validators",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERIFIER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
console.log("Contract Address:", CONTRACT_ADDRESS);
const Web3Context = createContext({});

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

// Sepolia network configuration
const SEPOLIA_CHAIN_ID = 11155111;
const REQUIRED_CHAIN_ID = SEPOLIA_CHAIN_ID;
const NETWORK_NAME = "Sepolia";

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isIssuer, setIsIssuer] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [validatorInfo, setValidatorInfo] = useState({ rep: 0, stake: 0, vp: 0 });

  // Switch to required network
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
      });
      setIsWrongNetwork(false);
      // Reconnect after switching
      window.location.reload();
    } catch (switchError) {
      // If the chain hasn't been added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
      console.error("Failed to switch network:", switchError);
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      const currentAccount = accounts[0];

      console.log("Connected wallet:", currentAccount);
      console.log("Network chainId:", network.chainId);
      console.log("Required chainId:", REQUIRED_CHAIN_ID);
      console.log("Contract address:", CONTRACT_ADDRESS);

      setProvider(provider);
      setSigner(signer);
      setAccount(currentAccount);
      setChainId(network.chainId);

      // Check if on correct network
      if (network.chainId !== REQUIRED_CHAIN_ID) {
        console.error(`Wrong network! Connected to ${network.chainId}, need ${REQUIRED_CHAIN_ID} (${NETWORK_NAME})`);
        setIsWrongNetwork(true);
        setIsConnecting(false);
        return currentAccount;
      }

      setIsWrongNetwork(false);

      if (CONTRACT_ADDRESS) {
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);

        // Immediately check roles with the new contract instance
        try {
          console.log("Checking roles immediately after connect...");
          const issuer = await contractInstance.isIssuer(currentAccount);
          const verifier = await contractInstance.isVerifier(currentAccount);
          const info = await contractInstance.getValidatorInfo(currentAccount);

          console.log("Immediate role check - isIssuer:", issuer, "isVerifier:", verifier);

          setIsIssuer(issuer);
          setIsVerifier(verifier);
          setValidatorInfo({
            rep: ethers.utils.formatEther(info.rep),
            stake: ethers.utils.formatEther(info.st),
            vp: ethers.utils.formatEther(info.vp),
          });
        } catch (roleError) {
          console.error("Failed to check roles on connect:", roleError);
        }
      }

      return currentAccount;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setChainId(null);
    setIsIssuer(false);
    setIsVerifier(false);
    setValidatorInfo({ rep: 0, stake: 0, vp: 0 });
  }, []);

  // Check roles
  const checkRoles = useCallback(async () => {
    console.log("checkRoles called", { contract: !!contract, account });

    if (!contract || !account) {
      console.log("No contract or account, skipping role check");
      return;
    }

    try {
      console.log("Checking roles for account:", account);
      console.log("Contract address:", CONTRACT_ADDRESS);

      const issuer = await contract.isIssuer(account);
      console.log("isIssuer result:", issuer);

      const verifier = await contract.isVerifier(account);
      console.log("isVerifier result:", verifier);

      const info = await contract.getValidatorInfo(account);
      console.log("validatorInfo result:", info);

      setIsIssuer(issuer);
      setIsVerifier(verifier);
      setValidatorInfo({
        rep: ethers.utils.formatEther(info.rep),
        stake: ethers.utils.formatEther(info.st),
        vp: ethers.utils.formatEther(info.vp),
      });

      console.log("Roles updated - isIssuer:", issuer, "isVerifier:", verifier);
    } catch (error) {
      console.error("Failed to check roles:", error);
    }
  }, [contract, account]);

  // Issue a credential on-chain
  const issueCredentialOnChain = useCallback(
    async (dataHash) => {
      if (!contract) throw new Error("Contract not connected");
      if (!isIssuer) throw new Error("Not registered as issuer");

      const tx = await contract.issueCredential(dataHash);
      const receipt = await tx.wait();

      // Get credential ID from the event
      const event = receipt.events?.find((e) => e.event === "CredentialIssued");
      const credentialId = event?.args?.id?.toNumber();

      return { tx, receipt, credentialId };
    },
    [contract, isIssuer]
  );

  // Check if a credential is finalized
  const isCredentialFinalized = useCallback(
    async (credentialId) => {
      if (!contract) throw new Error("Contract not connected");
      return await contract.isFinalized(credentialId);
    },
    [contract]
  );

  // Get credential details from chain
  const getCredentialFromChain = useCallback(
    async (credentialId) => {
      if (!contract) throw new Error("Contract not connected");
      const cred = await contract.credentials(credentialId);
      return {
        issuer: cred.issuer,
        finalized: cred.finalized,
        dataHash: cred.dataHash,
      };
    },
    [contract]
  );

  // Get total voting power
  const getTotalVP = useCallback(async () => {
    if (!contract) throw new Error("Contract not connected");
    const vp = await contract.totalVP();
    return ethers.utils.formatEther(vp);
  }, [contract]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account, disconnectWallet, connectWallet]);

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            console.log("Auto-connecting previously connected wallet...");
            await connectWallet();
          }
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };
    autoConnect();
  }, [connectWallet]);

  // Check roles when account or contract changes
  useEffect(() => {
    checkRoles();
  }, [checkRoles]);

  const value = {
    provider,
    signer,
    contract,
    account,
    chainId,
    isConnecting,
    isConnected: !!account,
    isIssuer,
    isVerifier,
    isWrongNetwork,
    validatorInfo,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    checkRoles,
    issueCredentialOnChain,
    isCredentialFinalized,
    getCredentialFromChain,
    getTotalVP,
    CONTRACT_ADDRESS,
    NETWORK_NAME,
    REQUIRED_CHAIN_ID,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
