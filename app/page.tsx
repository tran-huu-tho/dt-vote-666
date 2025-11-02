'use client';

import { useState, useRef, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import DonationForm from './components/DonationForm';
import DonorsList from './components/DonorsList';
import TopDonors from './components/TopDonors';
import CampaignListSimple from './components/CampaignListSimple';
import CreateCampaignModal from './components/CreateCampaignModal';
import CampaignDetail from './components/CampaignDetail';
import ThemeToggle from './components/ThemeToggle';

type TabType = 'home' | 'history' | 'top';

interface Campaign {
  id: number;
  title: string;
  description: string;
  targetAmount: string;
  totalRaised: string;
  createdAt: number;
  isActive: boolean;
  isDeleted: boolean;
  creator: string;
}

export default function Home() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Campaign states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const ADMIN_ADDRESS = '0xfedbd76caeb345e2d1ddac06c442b86638b65bca';
  const isAdmin = account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const handleAccountChange = (newAccount: string, newBalance: string) => {
    setAccount(newAccount);
    setBalance(newBalance);
  };

  const handleDisconnect = async () => {
    try {
      // Revoke permissions - chỉ work với MetaMask version mới
      if (window.ethereum?.request) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          });
        } catch (revokeError) {
          // Nếu không support revoke, thử cách khác
          console.log('Revoke not supported, using alternative method');
        }
      }
      
      // Clear state
      setAccount('');
      setBalance('');
      setShowDropdown(false);
      
      // Reload page để reset hoàn toàn
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting:', error);
      // Vẫn reload để reset state
      window.location.reload();
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDonationSuccess = async () => {
    // Tăng trigger để làm mới danh sách người quyên góp
    setRefreshTrigger(prev => prev + 1);
    
    // Đợi 2 giây để transaction được confirm rồi mới refresh balance
    setTimeout(async () => {
      if (account && window.ethereum) {
        try {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(account);
          const balanceInCET = ethers.formatEther(balance);
          setBalance(balanceInCET);
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }
    }, 2000);
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
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between py-3 sm:py-4">
              {/* Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-xl font-bold text-white">DT VOTE 666</h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8 lg:gap-12">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`font-medium transition-all ${
                    activeTab === 'home'
                      ? 'bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent'
                      : 'text-white/60 hover:text-green-400'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent'
                      : 'text-white/60 hover:text-green-400'
                  }`}
                >
                  Lịch sử
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`font-medium transition-all ${
                    activeTab === 'top'
                      ? 'bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent'
                      : 'text-white/60 hover:text-green-400'
                  }`}
                >
                  Top quyên góp
                </button>
              </div>

              {/* Wallet Info & Login Button */}
              <div className="flex items-center gap-3 sm:gap-4">
                {account ? (
                  <>
                    <div className="hidden lg:block">
                      <p className="text-xs sm:text-sm text-white/60">
                        Số dư: <span className="text-white font-semibold">{parseFloat(balance).toFixed(4)} CET</span>
                      </p>
                    </div>
                    <div className="hidden lg:block h-6 w-px bg-white/20"></div>
                    
                    {/* Dropdown for wallet address */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-mono text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                      >
                        <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                          <button
                            onClick={handleDisconnect}
                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Ngắt kết nối
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <WalletConnect onAccountChange={handleAccountChange} />
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden gap-6 sm:gap-8 pb-3 overflow-x-auto border-t border-white/10 pt-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
                  activeTab === 'home'
                    ? 'text-white'
                    : 'text-white/60'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
                  activeTab === 'history'
                    ? 'text-white'
                    : 'text-white/60'
                }`}
              >
                Lịch sử
              </button>
              <button
                onClick={() => setActiveTab('top')}
                className={`font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
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

        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          {/* Tab Content */}
          {activeTab === 'home' && (
            <div className="space-y-6 sm:space-y-8 fade-in-up">
              {/* Hero Section */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-2 sm:mb-3">
                  Quyên Góp Blockchain
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
                  Minh bạch, an toàn và nhanh chóng với công nghệ blockchain
                </p>
              </div>

              {/* Nút tạo chiến dịch (chỉ admin) */}
              {isAdmin && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    + Tạo chiến dịch mới
                  </button>
                </div>
              )}

              {/* Danh sách chiến dịch */}
              <CampaignListSimple
                account={account}
                onSelectCampaign={(campaign: Campaign) => setSelectedCampaign(campaign)}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="fade-in-up">
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
        <footer className="mt-12 sm:mt-16 pb-6 sm:pb-8">
          <div className="container mx-auto px-4">
            <div className="glass rounded-lg p-3 sm:p-4 max-w-4xl mx-auto text-center">
              <p className="text-xs sm:text-sm text-white/60">
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

      {/* Modal tạo chiến dịch */}
      {isAdmin && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1);
            setShowCreateModal(false);
          }}
          account={account}
        />
      )}

      {/* Modal chi tiết chiến dịch */}
      <CampaignDetail
        campaign={selectedCampaign}
        account={account}
        onClose={() => setSelectedCampaign(null)}
        onUpdate={async () => {
          setRefreshTrigger(prev => prev + 1);
          
          // Refresh balance ngay lập tức
          if (account && window.ethereum) {
            try {
              const { ethers } = await import('ethers');
              const provider = new ethers.BrowserProvider(window.ethereum);
              const balance = await provider.getBalance(account);
              const balanceInCET = ethers.formatEther(balance);
              setBalance(balanceInCET);
              console.log('✅ [Balance] Đã cập nhật số dư ví:', balanceInCET, 'CET');
            } catch (error) {
              console.error('❌ [Balance] Lỗi khi refresh balance:', error);
            }
          }
          
          setSelectedCampaign(null);
        }}
      />
    </>
  );
}
