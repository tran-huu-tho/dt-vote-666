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

interface CampaignListSimpleProps {
  account: string;
  onSelectCampaign: (campaign: Campaign) => void;
  refreshTrigger?: number;
}

export default function CampaignListSimple({ account, onSelectCampaign, refreshTrigger }: CampaignListSimpleProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ADMIN_ADDRESS = '0xfedbd76caeb345e2d1ddac06c442b86638b65bca';
  const isAdmin = account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  useEffect(() => {
    loadCampaigns();
  }, [refreshTrigger]);

  const loadCampaigns = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 [CampaignList] Starting to load campaigns...');
      console.log('📍 [CampaignList] Contract address:', CAMPAIGN_CONTRACT_ADDRESS);
      
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider('https://testnet-rpc.coinex.net');
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, provider);

      console.log('📡 [CampaignList] Calling campaignCounter...');
      const campaignCounter = await contract.campaignCounter();
      console.log('📊 [CampaignList] Campaign counter:', campaignCounter.toString());
      
      const campaignList: Campaign[] = [];

      for (let i = 1; i <= Number(campaignCounter); i++) {
        try {
          console.log(`📖 [CampaignList] Loading campaign #${i}...`);
          const campaign = await contract.getCampaign(i);
          console.log(`✅ [CampaignList] Campaign #${i}:`, campaign.title, '| Deleted:', campaign.isDeleted);
          
          // Skip deleted campaigns
          if (campaign.isDeleted) {
            console.log(`⏭️  [CampaignList] Skipping deleted campaign #${i}`);
            continue;
          }
          
          campaignList.push({
            id: Number(campaign.id),
            title: campaign.title,
            description: campaign.description,
            targetAmount: ethers.formatEther(campaign.targetAmount),
            totalRaised: ethers.formatEther(campaign.totalRaised),
            createdAt: Number(campaign.createdAt),
            isActive: campaign.isActive,
            isDeleted: campaign.isDeleted,
            creator: campaign.creator
          });
        } catch (err) {
          console.error(`❌ [CampaignList] Error loading campaign ${i}:`, err);
        }
      }
      
      console.log(`✅ [CampaignList] Loaded ${campaignList.length} campaigns`);
      setCampaigns(campaignList);
    } catch (err: any) {
      console.error('❌ [CampaignList] Fatal error:', err);
      setError(err.message || 'Không thể tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (raised: string, target: string) => {
    const raisedNum = parseFloat(raised);
    const targetNum = parseFloat(target);
    if (targetNum === 0) return 0;
    return Math.min((raisedNum / targetNum) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Đang tải danh sách chiến dịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 border border-red-500/30 text-center">
        <p className="text-red-400 font-bold mb-2">❌ Lỗi khi tải chiến dịch</p>
        <p className="text-white/60 text-sm mb-4">{error}</p>
        <button
          onClick={loadCampaigns}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">Chưa có chiến dịch nào</h3>
        <p className="text-white/60 mb-2">
          {isAdmin 
            ? 'Bấm nút "Tạo chiến dịch mới" để bắt đầu' 
            : 'Admin chưa tạo chiến dịch nào'}
        </p>
        <p className="text-xs text-white/40 mt-4">
          Contract: {CAMPAIGN_CONTRACT_ADDRESS.slice(0, 10)}...
        </p>
        <button
          onClick={loadCampaigns}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold"
        >
          🔄 Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          onClick={() => onSelectCampaign(campaign)}
          className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group transform hover:scale-[1.02]"
        >
          {/* Header */}
          <div className={`p-4 ${campaign.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                campaign.isActive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {campaign.isActive ? '🟢 Đang mở' : '🔴 Đã đóng'}
              </span>
              <span className="text-xs text-white/60">#{campaign.id}</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 min-h-14">
              {campaign.title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Mô tả */}
            <p className="text-sm text-white/70 line-clamp-3 min-h-[60px]">
              {campaign.description}
            </p>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Đã quyên góp:</span>
                <span className="text-green-400 font-bold">
                  {parseFloat(campaign.totalRaised).toFixed(2)} CET
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Mục tiêu:</span>
                <span className="text-white/90 font-bold">
                  {parseFloat(campaign.targetAmount).toFixed(0)} CET
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${getProgress(campaign.totalRaised, campaign.targetAmount)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-white/40">
                <span>{getProgress(campaign.totalRaised, campaign.targetAmount).toFixed(1)}%</span>
                <span>
                  {parseFloat(campaign.totalRaised) >= parseFloat(campaign.targetAmount) 
                    ? '✅ Đạt mục tiêu' 
                    : `Còn ${(parseFloat(campaign.targetAmount) - parseFloat(campaign.totalRaised)).toFixed(0)} CET`
                  }
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                campaign.isActive
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isAdmin ? '⚙️ Quản lý' : (campaign.isActive ? '💝 Quyên góp ngay' : '🔒 Đã đóng')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
