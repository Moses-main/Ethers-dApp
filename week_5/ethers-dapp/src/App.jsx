import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css'; // External CSS

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState(null);  // Track the current network

  let provider;
  let signer;

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
    setNetwork(chainId);
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

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setRecipient('');
    setAmount('');
  };

  // Switch Network (for Testnets)
  const switchNetwork = async (chainId) => {
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    } catch (switchError) {
      console.error('Network switch failed:', switchError);
    }
  };

  // Check Network and Adjust UI
  const getNetworkName = () => {
    switch (network) {
      case '0x1':
        return 'Mainnet';
      case '0x4':
        return 'Rinkeby Testnet';
      case '0x5':
        return 'Goerli Testnet';
      default:
        return 'Unknown Network';
    }
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
          <h3 className="card-title">Network: {getNetworkName()}</h3>
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
            {/* Testnet Switch Buttons */}
            {/* <div>
              <button className="button" onClick={() => switchNetwork('0x4')}>Switch to Rinkeby</button>
              <button className="button" onClick={() => switchNetwork('0x5')}>Switch to Goerli</button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
