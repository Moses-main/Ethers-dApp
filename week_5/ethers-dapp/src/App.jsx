import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css'; // Import external CSS

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.0");
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  let provider;
  let signer;

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      provider = new ethers.BrowserProvider(window.ethereum);
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', handleChainChange);
    } else {
      alert('Please install MetaMask to use this DApp!');
    }
  }, []);

  const handleAccountChange = (accounts) => {
    setAccount(accounts[0]);
    fetchBalance();
  };

  const handleChainChange = (chainId) => {
    console.log('Chain changed to: ', chainId);
  };

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
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
