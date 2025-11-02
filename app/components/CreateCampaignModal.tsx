'use client';
import { useState } from 'react';
import { CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI } from '../utils/campaign-contract';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: string;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export default function CreateCampaignModal({ isOpen, onClose, onSuccess, account }: CreateCampaignModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const handleCreate = async () => {
    if (!title.trim()) {
      showNotification('error', 'Vui lòng nhập tiêu đề chiến dịch!');
      return;
    }
    if (!description.trim()) {
      showNotification('error', 'Vui lòng nhập mô tả chiến dịch!');
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showNotification('error', 'Vui lòng nhập số tiền mục tiêu hợp lệ!');
      return;
    }

    if (!window.ethereum) {
      showNotification('error', 'Vui lòng cài đặt MetaMask!');
      return;
    }

    setIsCreating(true);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, signer);

      const targetInWei = ethers.parseEther(targetAmount);
      
      showNotification('info', 'Đang chuẩn bị giao dịch...');
      
      // Lấy gas price hiện tại
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      
      // Gọi contract với gas settings tối ưu
      const tx = await contract.createCampaign(title, description, targetInWei, {
        gasLimit: 800000, // Tăng gas limit lên rất cao
        gasPrice: gasPrice ? gasPrice * BigInt(120) / BigInt(100) : undefined // +20% gas price
      });
      
      showNotification('info', 'Đang xử lý giao dịch... (có thể mất 30-60 giây)');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showNotification('success', 'Tạo chiến dịch thành công!');
        
        // Reset form
        setTitle('');
        setDescription('');
        setTargetAmount('');
        
        // Đợi 2 giây rồi đóng modal và reload
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        showNotification('error', 'Giao dịch thất bại. Vui lòng thử lại!');
      }

    } catch (error: unknown) {
      console.error('Lỗi khi tạo chiến dịch:', error);
      if (error instanceof Error) {
        if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          showNotification('warning', 'Bạn đã hủy giao dịch');
        } else if (error.message.includes('insufficient funds')) {
          showNotification('error', 'Không đủ CET để trả phí gas!');
        } else {
          showNotification('error', 'Lỗi RPC. Vui lòng thử lại sau vài giây!');
        }
      } else {
        showNotification('error', 'Lỗi khi tạo chiến dịch!');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

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

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="glass-strong rounded-2xl max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-500/20 to-cyan-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Tạo Chiến Dịch Mới</h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Tiêu đề chiến dịch <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cứu trợ lũ lụt miền Trung"
                className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all"
                maxLength={100}
              />
              <p className="text-xs text-white/40 mt-1">{title.length}/100 ký tự</p>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Mô tả chiến dịch <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về mục đích, kế hoạch sử dụng tiền quyên góp..."
                className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all resize-none"
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-white/40 mt-1">{description.length}/500 ký tự</p>
            </div>

            {/* Số tiền mục tiêu */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Số tiền mục tiêu (CET) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="VD: 1000"
                className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-white/60 mt-1">
                Số tiền bạn muốn quyên góp được (có thể vượt mục tiêu)
              </p>
            </div>

            {/* Lưu ý */}
            <div className="glass rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/10">
              <p className="text-xs text-yellow-300">
                <strong>Lưu ý:</strong> Sau khi tạo chiến dịch, bạn không thể chỉnh sửa thông tin. 
                Chỉ có thể đóng/mở chiến dịch và rút tiền khi cần.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang tạo...
                </>
              ) : (
                'Tạo chiến dịch'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
