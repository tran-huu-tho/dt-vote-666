'use client';
import { useState, useEffect } from 'react';
import { CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI } from '../utils/campaign-contract';

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

interface CampaignDetailProps {
  campaign: Campaign | null;
  account: string;
  onClose: () => void;
  onUpdate: () => void;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export default function CampaignDetail({ campaign, account, onClose, onUpdate }: CampaignDetailProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const ADMIN_ADDRESS = '0xfedbd76caeb345e2d1ddac06c442b86638b65bca';
  const isAdmin = account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'info': return 'bg-blue-600';
    }
  };

  const handleDonate = async () => {
    if (!campaign) return;

    if (!campaign.isActive) {
      showNotification('error', 'Chiến dịch đã đóng!');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      showNotification('error', 'Vui lòng nhập số tiền quyên góp!');
      return;
    }

    if (!window.ethereum) {
      showNotification('error', 'Vui lòng cài đặt MetaMask!');
      return;
    }

    setIsDonating(true);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(donationAmount);

      // Kiểm tra số dư
      const userBalance = await provider.getBalance(account);
      const gasEstimate = BigInt(150000);
      const gasPrice = (await provider.getFeeData()).gasPrice || BigInt(0);
      const totalRequired = amountInWei + (gasEstimate * gasPrice);

      if (userBalance < totalRequired) {
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
        setIsDonating(false);
        return;
      }

      const tx = await contract.donate(campaign.id, {
        value: amountInWei,
        gasLimit: 150000
      });

      showNotification('info', 'Đang xử lý giao dịch...');
      await tx.wait();

      showNotification('success', `Quyên góp ${donationAmount} CET thành công!`);
      setDonationAmount('');
      
      // Đợi 2 giây rồi cập nhật
      setTimeout(() => {
        onUpdate();
      }, 2000);

    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      const errorCode = error?.code;
      
      if (errorCode === 'ACTION_REJECTED' || 
          errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')) {
        // User cancelled - không log error
        showNotification('warning', 'Bạn đã hủy giao dịch');
      } else {
        // Lỗi thật sự - mới log ra console
        console.error('Lỗi khi quyên góp:', error);
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
      }
    } finally {
      setIsDonating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!campaign) return;

    setIsTogglingStatus(true);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, signer);

      if (campaign.isActive) {
        const tx = await contract.closeCampaign(campaign.id);
        showNotification('info', 'Đang xử lý...');
        await tx.wait();
        showNotification('success', 'Đã đóng chiến dịch!');
      } else {
        const tx = await contract.openCampaign(campaign.id);
        showNotification('info', 'Đang xử lý...');
        await tx.wait();
        showNotification('success', 'Đã mở lại chiến dịch!');
      }

      setTimeout(() => {
        onUpdate();
      }, 2000);

    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      const errorCode = error?.code;
      
      if (errorCode === 'ACTION_REJECTED' || 
          errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')) {
        showNotification('warning', 'Bạn đã hủy giao dịch');
      } else {
        console.error('Lỗi khi thay đổi trạng thái:', error);
        showNotification('error', 'Lỗi khi thay đổi trạng thái chiến dịch!');
      }
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleWithdraw = async () => {
    if (!campaign) return;

    if (parseFloat(campaign.totalRaised) === 0) {
      showNotification('warning', 'Không có tiền để rút!');
      return;
    }

    setIsWithdrawing(true);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, signer);

      const tx = await contract.withdrawFunds(campaign.id);
      showNotification('info', 'Đang xử lý giao dịch...');
      const receipt = await tx.wait();

      const txHash = receipt.hash.slice(0, 10) + '...' + receipt.hash.slice(-8);
      showNotification('success', `Đã rút ${campaign.totalRaised} CET thành công! TX: ${txHash}`);

      setTimeout(() => {
        onUpdate();
      }, 2000);

    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      const errorCode = error?.code;
      
      if (errorCode === 'ACTION_REJECTED' || 
          errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')) {
        showNotification('warning', 'Bạn đã hủy giao dịch');
      } else {
        console.error('Lỗi khi rút tiền:', error);
        showNotification('error', 'Lỗi khi rút tiền từ chiến dịch!');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;

    if (parseFloat(campaign.totalRaised) > 0) {
      showNotification('error', 'Không thể xóa chiến dịch còn tiền! Vui lòng rút hết tiền trước.');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa chiến dịch "${campaign.title}"?\n\nChiến dịch sẽ bị ẩn khỏi danh sách nhưng dữ liệu vẫn được lưu trên blockchain.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, signer);

      const tx = await contract.deleteCampaign(campaign.id, {
        gasLimit: 150000
      });
      showNotification('info', 'Đang xử lý giao dịch...');
      await tx.wait();

      showNotification('success', 'Đã xóa chiến dịch thành công!');

      setTimeout(() => {
        onClose();
        onUpdate();
      }, 2000);

    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      const errorCode = error?.code;
      
      if (errorCode === 'ACTION_REJECTED' || 
          errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') ||
          errorMessage.includes('user cancelled')) {
        showNotification('warning', 'Bạn đã hủy giao dịch');
      } else {
        console.error('Lỗi khi xóa chiến dịch:', error);
        showNotification('error', 'Lỗi khi xóa chiến dịch!');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getProgress = () => {
    if (!campaign) return 0;
    const raisedNum = parseFloat(campaign.totalRaised);
    const targetNum = parseFloat(campaign.targetAmount);
    if (targetNum === 0) return 0;
    return Math.min((raisedNum / targetNum) * 100, 100);
  };

  if (!campaign) return null;

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-60 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${getNotificationColor(notif.type)} text-white p-4 rounded-lg shadow-2xl flex items-start justify-between animate-slide-in`}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">{notif.message}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="shrink-0 text-white/80 hover:text-white ml-3"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="glass-strong rounded-2xl max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b border-white/10 ${campaign.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  campaign.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {campaign.isActive ? 'Đang mở' : 'Đã đóng'}
                </span>
                <span className="text-sm text-white/60">ID: {campaign.id}</span>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{campaign.title}</h2>
            <p className="text-white/70">{campaign.description}</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột trái - Thống kê */}
              <div className="space-y-4">
                {/* Tiến độ */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white/60 mb-3">Tiến độ quyên góp</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Đã quyên góp</span>
                      <span className="text-green-400 font-bold text-lg">{parseFloat(campaign.totalRaised).toFixed(4)} CET</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">{getProgress().toFixed(1)}%</span>
                      <span className="text-white/60">Mục tiêu: {parseFloat(campaign.targetAmount).toFixed(0)} CET</span>
                    </div>
                  </div>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="glass rounded-xl p-4 border border-red-500/30 space-y-3">
                    <h3 className="text-sm font-bold text-white/60 mb-3">Quản lý chiến dịch</h3>
                    
                    <button
                      onClick={handleToggleStatus}
                      disabled={isTogglingStatus}
                      className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 ${
                        campaign.isActive
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isTogglingStatus ? 'Đang xử lý...' : (campaign.isActive ? 'Đóng chiến dịch' : 'Mở lại chiến dịch')}
                    </button>

                    <button
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || parseFloat(campaign.totalRaised) === 0}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWithdrawing ? 'Đang rút...' : `Rút ${parseFloat(campaign.totalRaised).toFixed(4)} CET`}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isDeleting || parseFloat(campaign.totalRaised) > 0}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xóa chiến dịch'}
                    </button>
                    
                    {parseFloat(campaign.totalRaised) > 0 && (
                      <p className="text-xs text-yellow-400">
                        ⚠️ Rút hết tiền trước khi xóa chiến dịch
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Cột phải - Form quyên góp */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white/60 mb-4">
                  {isAdmin ? 'Quyên góp (Admin)' : 'Quyên góp cho chiến dịch'}
                </h3>
                  
                  {campaign.isActive ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Số lượng CET</label>
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[0.1, 0.5, 1, 5].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setDonationAmount(amount.toString())}
                            className="py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-all"
                          >
                            {amount}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleDonate}
                        disabled={isDonating}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isDonating ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Đang xử lý...
                          </>
                        ) : (
                          'Quyên góp ngay'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-red-400 font-bold">Chiến dịch đã đóng</p>
                      <p className="text-white/60 text-sm mt-2">Không thể quyên góp vào chiến dịch này</p>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
