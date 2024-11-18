import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css'; // External CSS

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [votingStatus, setVotingStatus] = useState(''); // Voting status message
  const [voted, setVoted] = useState(false); // Track if the user has voted

  let provider;
  let signer;

  // Contract details
  const contractAddress = '0xB2E1185468e57A801a54162F27725CbD5B0EB4a6';
  const contractABI = [
    "function vote(uint256 proposalId) public",
    "function proposal1Votes() view returns (uint256)",
    "function proposal2Votes() view returns (uint256)"
  ];

  const votingContract = new ethers.Contract(contractAddress, contractABI, provider);

  // On Component Mount: Check if MetaMask is available
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      provider = new ethers.BrowserProvider(window.ethereum);
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', handleChainChange);
    } else {
      alert('Please install MetaMask to use this DApp!');
    }
  }, []);

  // Handle Account Change
  const handleAccountChange = (accounts) => {
    setAccount(accounts[0]);
    fetchBalance();
  };

  // Handle Network Change
  const handleChainChange = (chainId) => {
    console.log('Network changed to: ', chainId);
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      signer = provider.getSigner();
      fetchBalance();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // Fetch Balance
  const fetchBalance = async () => {
    if (!account) return;
    try {
      const balance = await provider.getBalance(account);
      const balanceInETH = ethers.formatEther(balance);
      setBalance(balanceInETH);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Send ETH
  const sendETH = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient address and amount');
      return;
    }

    try {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      // Wait for the transaction to be mined
      await tx.wait();
      alert('Transaction Successful!');
      fetchBalance();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed.');
    }
  };

  // Vote for a proposal
  const vote = async (proposalId) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const tx = await votingContract.connect(signer).vote(proposalId);
      await tx.wait();
      setVoted(true);
      setVotingStatus(`Successfully voted for Proposal ${proposalId}`);
    } catch (error) {
      console.error('Voting failed:', error);
      setVotingStatus('Voting failed.');
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setRecipient('');
    setAmount('');
    setVotingStatus('');
    setVoted(false);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">SendETH DApp</h1>
      {!account ? (
        <button className="button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="card">
          <h3 className="card-title">Account: {account}</h3>
          <h3 className="card-title">Balance: {balance} ETH</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
            <button className="button" onClick={sendETH}>
              Send ETH
            </button>
            <button className="button" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          </div>

          {/* Voting Section */}
          {!voted && (
            <div className="voting-section">
              <h3>Vote on Proposals</h3>
              <button className="button" onClick={() => vote(1)}>Vote for Proposal 1</button>
              <button className="button" onClick={() => vote(2)}>Vote for Proposal 2</button>
            </div>
          )}
          {votingStatus && <p>{votingStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default App;
