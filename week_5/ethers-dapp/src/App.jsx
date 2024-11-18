import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, TextField, Typography, Container, Grid, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gasFee, setGasFee] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
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

  const fetchGasFee = async () => {
    try {
      const gasPrice = await provider.getGasPrice();
      setGasFee(ethers.formatEther(gasPrice));
    } catch (error) {
      console.error('Error fetching gas fee:', error);
    }
  };

  const sendETH = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient address and amount');
      return;
    }

    setIsSending(true);
    try {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      // Wait for the transaction to be mined
      await tx.wait();

      setTransactions((prev) => [
        ...prev,
        {
          hash: tx.hash,
          amount,
          recipient,
          timestamp: new Date().toLocaleString(),
        },
      ]);

      alert('Transaction Successful!');
      fetchBalance();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>SendETH DApp</Typography>
      {!account ? (
        <Button variant="contained" onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Account: {account}</Typography>
            <Typography variant="h6">Balance: {balance} ETH</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Recipient Address"
              fullWidth
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount (ETH)"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>

          {gasFee && (
            <Grid item xs={12}>
              <Typography variant="body1">Estimated Gas Fee: {gasFee} ETH</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={sendETH}
              disabled={isSending}
            >
              {isSending ? <CircularProgress size={24} /> : 'Send ETH'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3}>
              <Typography variant="h6" gutterBottom>Transaction History</Typography>
              <List>
                {transactions.length === 0 ? (
                  <Typography variant="body1">No transactions yet.</Typography>
                ) : (
                  transactions.map((tx, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={`Sent ${tx.amount} ETH to ${tx.recipient}`}
                          secondary={`Transaction Hash: ${tx.hash} | Date: ${tx.timestamp}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default App;
