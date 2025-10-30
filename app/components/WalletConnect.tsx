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
      await checkNetwork();
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== COINEX_TESTNET_CONFIG.chainId) {
        await switchToCoinExTestnet();
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await updateAccountInfo(accounts[0]);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      // Không hiển thị lỗi nếu user từ chối
      if (error.code !== 4001) {
        console.log('Wallet connection failed');
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
          className="btn-gradient px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
        </button>
      ) : (
        <>
          {!isCorrectNetwork && (
            <button
              onClick={switchToCoinExTestnet}
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              Chuyển mạng
            </button>
          )}
        </>
      )}
    </>
  );
}
