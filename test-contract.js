// Test script - Kiểm tra contract address
import { ethers } from 'ethers';

async function test() {
  const contractAddress = '0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0'; // Contract cũ để test
  const provider = new ethers.JsonRpcProvider('https://testnet-rpc.coinex.net');
  
  console.log('Testing connection to:', contractAddress);
  
  try {
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('❌ No contract at this address');
    } else {
      console.log('✅ Contract exists!');
      console.log('Code length:', code.length);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
