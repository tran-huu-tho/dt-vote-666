'use client';

import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import DonationForm from './components/DonationForm';
import DonorsList from './components/DonorsList';

export default function Home() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAccountChange = (newAccount: string, newBalance: string) => {
    setAccount(newAccount);
    setBalance(newBalance);
  };

  const handleDonationSuccess = () => {
    // Tăng trigger để làm mới danh sách người quyên góp
    setRefreshTrigger(prev => prev + 1);
    
    // Cập nhật lại số dư ví
    if (account && window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Ứng dụng quyên góp
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ứng dụng quyên góp phi tập trung trên CoinEx Smart Chain Testnet
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Minh bạch
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              An toàn
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Nhanh chóng
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Wallet Connection */}
          <div className="w-full flex justify-center">
            <WalletConnect onAccountChange={handleAccountChange} />
          </div>

          {/* Donation Form */}
          <div className="w-full flex justify-center">
            <DonationForm 
              account={account}
              onDonationSuccess={handleDonationSuccess}
            />
          </div>

          {/* Donors List */}
          <div className="w-full flex justify-center">
            <DonorsList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600">
          <div className="border-t border-gray-200 pt-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">Bảo mật</p>
                <p className="text-sm text-gray-600">Smart Contract đã audit</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">Nhanh chóng</p>
                <p className="text-sm text-gray-600">Transaction ~3-5 giây</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">Minh bạch</p>
                <p className="text-sm text-gray-600">100% công khai on-chain</p>
              </div>
            </div>
            <p className="text-sm">
              Powered by{' '}
              <a 
                href="https://www.coinex.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                CoinEx Smart Chain
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
