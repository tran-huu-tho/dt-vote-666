'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { COINEX_TESTNET_CONFIG } from '../utils/contract';

interface WalletConnectProps {
  onAccountChange: (account: string, balance: string) => void;
}

export default function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount('');
      setBalance('');
      onAccountChange('', '');
    } else {
      updateAccountInfo(accounts[0]);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await checkNetwork();
        await updateAccountInfo(accounts[0]);
      }
    } catch (error) {
      // Silent check - không hiển thị lỗi khi kiểm tra ban đầu
      console.log('Wallet not connected yet');
    }
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === COINEX_TESTNET_CONFIG.chainId);
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const switchToCoinExTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: COINEX_TESTNET_CONFIG.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: any) {
      // Nếu chain chưa được thêm vào MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [COINEX_TESTNET_CONFIG],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      } else {
        console.error('Error switching network:', switchError);
      }
    }
  };

  const updateAccountInfo = async (address: string) => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInCET = ethers.formatEther(balance);
      
      setAccount(address);
      setBalance(balanceInCET);
      onAccountChange(address, balanceInCET);
    } catch (error) {
      console.error('Error updating account info:', error);
      // Không throw error để tránh crash app
    }
  };

  // Thêm function để refresh balance từ bên ngoài
  const refreshBalance = async () => {
    if (account) {
      await updateAccountInfo(account);
    }
  };

  // Tự động refresh balance mỗi 15 giây
  useEffect(() => {
    if (account && window.ethereum) {
      const interval = setInterval(() => {
        updateAccountInfo(account);
      }, 15000); // 15 giây

      return () => clearInterval(interval);
    }
  }, [account]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Vui lòng cài đặt MetaMask!');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      setIsConnecting(true);
      
      // Kiểm tra và chuyển network trước
      try {
        await checkNetwork();
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== COINEX_TESTNET_CONFIG.chainId) {
          await switchToCoinExTestnet();
        }
      } catch (networkError: any) {
        // User từ chối chuyển mạng
        if (networkError.code === 4001) {
          console.log('User rejected network switch');
          setIsConnecting(false);
          return;
        }
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        await updateAccountInfo(accounts[0]);
      }
    } catch (error: any) {
      console.log('Connect wallet error:', error);
      // User từ chối kết nối - không làm gì cả
      if (error.code === 4001) {
        console.log('User rejected connection');
      } else if (error.code === -32002) {
        console.log('Connection request already pending');
      } else {
        console.error('Wallet connection failed:', error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setBalance('');
    onAccountChange('', '');
  };

  return (
    <>
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
        >
          {isConnecting ? 'ĐANG KẾT NỐI...' : 'KẾT NỐI VÍ'}
        </button>
      ) : (
        <>
          {!isCorrectNetwork && (
            <button
              onClick={switchToCoinExTestnet}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded text-sm transition-all uppercase"
            >
              CHUYỂN MẠNG
            </button>
          )}
        </>
      )}
    </>
  );
}
