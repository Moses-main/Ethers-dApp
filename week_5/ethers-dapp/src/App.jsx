import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { votingContractABI } from './votingContract.js';
import './App.css';  // Import the external CSS file

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [ethAmount, setEthAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [balance, setBalance] = useState("0.00");  // State to store balance

  // Your Infura API key and Sepolia network URL
  const INFURA_API_KEY = import.meta.env.INFURA_API_KEY;
  const SEP_URL = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

  useEffect(() => {
    const initialize = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
        const provider = new ethers.JsonRpcProvider(SEP_URL);
        setProvider(provider);

        // Connect to the signer (MetaMask or another wallet)
        const signer = provider.getSigner();
        setSigner(signer);

        // Set the contract address for your deployed smart contract
        const contractAddress = '0xB2E1185468e57A801a54162F27725CbD5B0EB4a6';
        const contract = new ethers.Contract(contractAddress, votingContractABI, signer);
        setVotingContract(contract);

        // Get the connected wallet address
        const address = await signer.getAddress();
        setUserAddress(address);

        // Fetch the wallet balance
        const walletBalance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(walletBalance)); // Format balance to ETH
      } else {
        console.log('MetaMask is not installed');
      }
    };

    initialize();
  }, []);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setUserAddress(address);

        // Fetch the wallet balance after connection
        const walletBalance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(walletBalance)); // Format balance to ETH
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  const handleSendEth = async () => {
    try {
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.utils.parseEther(ethAmount),
      });
      await tx.wait();
      setTransactionStatus('Transaction successful!');
    } catch (error) {
      console.error(error);
      setTransactionStatus('Transaction failed.');
    }
  };

  const handleVote = async (proposalIndex) => {
    try {
      const tx = await votingContract.vote(proposalIndex);
      await tx.wait();
      setTransactionStatus('Vote casted successfully!');
    } catch (error) {
      console.error(error);
      setTransactionStatus('Voting failed.');
    }
  };

  return (
    <div className="app-container">
      <h1>Ethereum Voting App</h1>
      {userAddress ? (
        <>
          <p>Connected Address: {userAddress}</p>
          <p>Balance: {balance} ETH</p> {/* Display the balance */}
        </>
      ) : (
        <div className="wallet-section">
          <button onClick={handleConnectWallet}>Connect Wallet</button>
        </div>
      )}

      <div className="send-eth-section">
        <h2>Send Sepolia ETH</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Amount (ETH)"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
        />
        <button onClick={handleSendEth}>Send ETH</button>
      </div>

      <div className="vote-section">
        <h2>Cast Vote</h2>
        <button onClick={() => handleVote(0)}>Vote for Proposal 1</button>
        <button onClick={() => handleVote(1)}>Vote for Proposal 2</button>
      </div>

      <div className={`transaction-status ${transactionStatus === 'Transaction successful!' || transactionStatus === 'Vote casted successfully!' ? 'success' : 'failed'}`}>
        {transactionStatus}
      </div>
    </div>
  );
};

export default App;
