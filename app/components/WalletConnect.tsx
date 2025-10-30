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
        updateAccountInfo(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInCET = ethers.formatEther(balance);
      
      setAccount(address);
      setBalance(balanceInCET);
      onAccountChange(address, balanceInCET);
    } catch (error) {
      console.error('Error updating account info:', error);
    }
  };

  // Thêm function để refresh balance từ bên ngoài
  const refreshBalance = async () => {
    if (account) {
      await updateAccountInfo(account);
    }
  };

  // Tự động refresh balance mỗi 10 giây
  useEffect(() => {
    if (account) {
      const interval = setInterval(() => {
        updateAccountInfo(account);
      }, 10000); // 10 giây

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
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Không thể kết nối ví. Vui lòng thử lại!');
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
    <div className="w-full max-w-2xl">
      {!account ? (
        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
          </button>
          <p className="text-center text-sm text-gray-600">Kết nối với CoinEx Smart Chain Testnet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          {!isCorrectNetwork && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">Vui lòng chuyển sang CoinEx Testnet</p>
              <button
                onClick={switchToCoinExTestnet}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Chuyển mạng
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium">Địa chỉ ví</p>
              <p className="font-mono text-sm font-medium text-gray-800 truncate">{account}</p>
            </div>
            <button
              onClick={disconnectWallet}
              className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium transition-colors shrink-0"
            >
              Ngắt kết nối
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500 font-medium">Số dư</p>
              <button
                onClick={() => updateAccountInfo(account)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                title="Làm mới số dư"
              >
                🔄 Làm mới
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600">
                {parseFloat(balance).toFixed(4)}
              </p>
              <span className="text-lg font-semibold text-gray-600">CET</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
