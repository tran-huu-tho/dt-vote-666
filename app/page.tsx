'use client';

import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import DonationForm from './components/DonationForm';
import DonorsList from './components/DonorsList';
import TopDonors from './components/TopDonors';
import ThemeToggle from './components/ThemeToggle';

type TabType = 'home' | 'history' | 'top';

export default function Home() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('home');

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
    <>
      {/* Cosmic Background */}
      <div className="cosmic-bg"></div>

      {/* Theme Toggle Button */}
      <ThemeToggle />

      <div className="min-h-screen relative z-10">
        {/* Top Navigation Bar */}
        <nav className="glass-strong border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-2xl font-black text-purple-900">
                  DT
                </div>
                <div>
                  <h1 className="text-2xl font-black text-yellow-400">DT VOTE 666</h1>
                  <p className="text-xs text-white/50">Blockchain Donation</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === 'home'
                      ? 'bg-yellow-400 text-purple-900'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === 'history'
                      ? 'bg-yellow-400 text-purple-900'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Lịch sử
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === 'top'
                      ? 'bg-yellow-400 text-purple-900'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Top quyên góp
                </button>
              </div>

              {/* Wallet Info */}
              <div className="flex items-center gap-3">
                {account ? (
                  <>
                    <div className="glass px-4 py-2 rounded-lg hidden lg:block">
                      <p className="text-xs text-white/50 mb-1">Số dư của bạn</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {parseFloat(balance).toFixed(4)} <span className="text-sm text-white/70">CET</span>
                      </p>
                    </div>
                    <div className="glass px-4 py-2.5 rounded-lg">
                      <p className="text-sm font-mono text-white font-semibold">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </p>
                    </div>
                  </>
                ) : (
                  <WalletConnect onAccountChange={handleAccountChange} />
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden gap-2 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === 'home'
                    ? 'bg-yellow-400 text-purple-900'
                    : 'text-white/70 hover:text-white glass'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === 'history'
                    ? 'bg-yellow-400 text-purple-900'
                    : 'text-white/70 hover:text-white glass'
                }`}
              >
                Lịch sử
              </button>
              <button
                onClick={() => setActiveTab('top')}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === 'top'
                    ? 'bg-yellow-400 text-purple-900'
                    : 'text-white/70 hover:text-white glass'
                }`}
              >
                Top quyên góp
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Tab Content */}
          {activeTab === 'home' && (
            <div className="space-y-8 fade-in-up">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl text-white font-bold mb-4">
                  Quyên Góp Blockchain - Minh Bạch 100%
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto mb-8">
                  Sử dụng công nghệ blockchain để đảm bảo tính minh bạch và công bằng. Kết quả được xác định bởi smart contract!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                    <h3 className="text-yellow-400 font-bold text-xl mb-2">Bảo mật cao</h3>
                    <p className="text-white/70 text-sm">Smart contract kiểm chứng</p>
                  </div>
                  <div className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                    <h3 className="text-yellow-400 font-bold text-xl mb-2">Nhanh chóng</h3>
                    <p className="text-white/70 text-sm">Kết quả tức thì</p>
                  </div>
                  <div className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                    <h3 className="text-yellow-400 font-bold text-xl mb-2">Minh bạch</h3>
                    <p className="text-white/70 text-sm">Mọi giao dịch công khai</p>
                  </div>
                </div>
              </div>

              {/* Donation Form */}
              <div className="w-full flex justify-center">
                <DonationForm 
                  account={account}
                  onDonationSuccess={handleDonationSuccess}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Lịch sử quyên góp</h2>
                <p className="text-white/70">Tất cả giao dịch quyên góp được ghi nhận trên blockchain</p>
              </div>
              <DonorsList refreshTrigger={refreshTrigger} />
            </div>
          )}

          {activeTab === 'top' && (
            <div className="fade-in-up">
              <TopDonors refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="glass-strong rounded-2xl p-6 max-w-4xl mx-auto text-center">
              <p className="text-sm text-white/60">
                Powered by{' '}
                <a 
                  href="https://www.coinex.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline"
                >
                  CoinEx Smart Chain
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
