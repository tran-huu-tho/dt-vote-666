'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COINEX_TESTNET_CONFIG } from '../utils/contract';

const ADMIN_ADDRESS = '0xfedbd76caeb345e2d1ddac06c442b86638b65bca';

interface AdminPanelProps {
  account: string;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export default function AdminPanel({ account }: AdminPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [campaignNote, setCampaignNote] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');

  useEffect(() => {
    checkAdminStatus();
    loadContractBalance();
    loadCampaignData();
  }, [account]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-600 border-green-500';
      case 'error': return 'bg-red-600 border-red-500';
      case 'warning': return 'bg-yellow-600 border-yellow-500';
      case 'info': return 'bg-blue-600 border-blue-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  const checkAdminStatus = () => {
    if (!account) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(account.toLowerCase() === ADMIN_ADDRESS.toLowerCase());
  };

  const loadContractBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(COINEX_TESTNET_CONFIG.rpcUrls[0]);
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      setContractBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadCampaignData = () => {
    // Load từ localStorage
    const note = localStorage.getItem('campaignNote') || '';
    const active = localStorage.getItem('campaignActive') !== 'false';
    setCampaignNote(note);
    setIsActive(active);
  };

  const handleSaveCampaignNote = () => {
    localStorage.setItem('campaignNote', campaignNote);
    showNotification('success', 'Đã lưu ghi chú chiến dịch!');
  };

  const handleToggleCampaign = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    localStorage.setItem('campaignActive', String(newStatus));
    showNotification('success', newStatus ? 'Đã mở lại quyên góp!' : 'Đã đóng quyên góp!');
  };

  const handleCreateCampaign = () => {
    if (!newCampaignTitle.trim()) {
      showNotification('error', 'Vui lòng nhập tiêu đề chiến dịch!');
      return;
    }
    localStorage.setItem('campaignNote', newCampaignTitle);
    setCampaignNote(newCampaignTitle);
    setIsActive(true);
    localStorage.setItem('campaignActive', 'true');
    setNewCampaignTitle('');
    setShowCreateCampaign(false);
    showNotification('success', 'Đã tạo chiến dịch quyên góp mới!');
  };

  const handleWithdraw = async () => {
    if (!window.ethereum) {
      showNotification('error', 'Vui lòng cài đặt MetaMask!');
      return;
    }

    if (parseFloat(contractBalance) === 0) {
      showNotification('warning', 'Không có tiền để rút!');
      return;
    }

    setIsWithdrawing(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Gọi withdraw function
      const tx = await contract.withdraw();
      
      showNotification('info', 'Đang xử lý giao dịch rút tiền...');
      await tx.wait();

      const amount = parseFloat(contractBalance).toFixed(4);
      showNotification('success', `Đã rút ${amount} CET về tài khoản thành công! Hash: ${tx.hash.substring(0, 10)}...`);
      
      // Reload balance
      setTimeout(() => {
        loadContractBalance();
      }, 2000);
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      if (error.code === 4001) {
        showNotification('error', 'Bạn đã từ chối giao dịch!');
      } else {
        showNotification('error', 'Lỗi: ' + (error.message || 'Không thể rút tiền'));
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${getNotificationColor(notif.type)} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl border-2 max-w-md scale-in flex items-start gap-2 sm:gap-3 text-sm sm:text-base`}
          >
            <div className="flex-1">
              <p className="font-semibold">{notif.message}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="shrink-0 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="w-full mb-8 fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="glass-strong rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-red-500/30">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-linear-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Bảng Điều Khiển Admin</h2>
                <p className="text-xs sm:text-sm text-white/60">Quản lý chiến dịch quyên góp</p>
              </div>
              <button
                onClick={() => setShowCreateCampaign(!showCreateCampaign)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
              >
                {showCreateCampaign ? 'Hủy' : 'Tạo chiến dịch mới'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Form tạo chiến dịch mới */}
            {showCreateCampaign && (
              <div className="glass rounded-xl p-4 sm:p-6 border border-blue-500/30 bg-blue-500/10">
                <label className="block text-sm font-bold text-white mb-3">
                  Tiêu đề chiến dịch mới
                </label>
                <input
                  type="text"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder="VD: Cứu trợ lũ lụt miền Trung, Học bổng sinh viên..."
                  className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  onClick={handleCreateCampaign}
                  className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-all"
                >
                  Tạo chiến dịch
                </button>
              </div>
            )}

            {/* Thống kê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2">Tổng tiền trong quỹ</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">
                  {parseFloat(contractBalance).toFixed(4)} CET
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2">Trạng thái chiến dịch</p>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className={`text-lg sm:text-xl font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {isActive ? 'Đang mở' : 'Đã đóng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú chiến dịch */}
            <div className="glass rounded-xl p-4 sm:p-6 border border-white/10">
              <label className="block text-sm font-bold text-white mb-3">
                Ghi chú chiến dịch quyên góp
              </label>
              <textarea
                value={campaignNote}
                onChange={(e) => setCampaignNote(e.target.value)}
                placeholder="VD: Cứu trợ lũ lụt miền Trung, Học bổng cho học sinh nghèo..."
                className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all resize-none text-sm"
                rows={3}
              />
              <button
                onClick={handleSaveCampaignNote}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
              >
                Lưu ghi chú
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Đóng/Mở quyên góp */}
              <button
                onClick={handleToggleCampaign}
                className={`p-4 rounded-xl font-bold transition-all text-sm sm:text-base ${
                  isActive
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isActive ? 'Đóng quyên góp' : 'Mở lại quyên góp'}
              </button>

              {/* Rút tiền */}
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || parseFloat(contractBalance) === 0}
                className="p-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isWithdrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  `Rút ${parseFloat(contractBalance).toFixed(4)} CET`
                )}
              </button>
            </div>

            {/* Thông báo */}
            {!isActive && (
              <div className="glass rounded-xl p-4 border-2 border-orange-500/50 bg-orange-500/10">
                <p className="text-sm text-orange-300">
                  Chiến dịch đã đóng. Người dùng không thể quyên góp khi chiến dịch đã đóng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
