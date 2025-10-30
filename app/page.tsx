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
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">DT VOTE 666</h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-12">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`font-medium transition-colors ${
                    activeTab === 'home'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Lịch sử
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`font-medium transition-colors ${
                    activeTab === 'top'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Top quyên góp
                </button>
              </div>

              {/* Wallet Info & Login Button */}
              <div className="flex items-center gap-3">
                {account ? (
                  <>
                    <div className="hidden lg:block">
                      <p className="text-sm text-white/60">
                        Số dư: <span className="text-white font-semibold">{parseFloat(balance).toFixed(4)} CET</span>
                      </p>
                    </div>
                    <div className="text-sm font-mono text-white/80">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                  </>
                ) : (
                  <WalletConnect onAccountChange={handleAccountChange} />
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden gap-8 pb-3 overflow-x-auto border-t border-white/10 pt-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'home'
                    ? 'text-white'
                    : 'text-white/60'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'history'
                    ? 'text-white'
                    : 'text-white/60'
                }`}
              >
                Lịch sử
              </button>
              <button
                onClick={() => setActiveTab('top')}
                className={`font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'top'
                    ? 'text-white'
                    : 'text-white/60'
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
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl text-white font-bold mb-3">
                  Quyên Góp Blockchain
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto text-lg">
                  Minh bạch, an toàn và nhanh chóng với công nghệ blockchain
                </p>
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Lịch sử quyên góp</h2>
                <p className="text-white/60">Tất cả giao dịch được ghi nhận trên blockchain</p>
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
        <footer className="mt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="glass rounded-lg p-4 max-w-4xl mx-auto text-center">
              <p className="text-sm text-white/60">
                Powered by{' '}
                <a 
                  href="https://www.coinex.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
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
