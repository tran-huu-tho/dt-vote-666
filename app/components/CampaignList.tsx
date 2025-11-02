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
  creator: string;
}

interface CampaignListProps {
  account: string;
  onSelectCampaign: (campaign: Campaign) => void;
  refreshTrigger?: number;
}

export default function CampaignList({ account, onSelectCampaign, refreshTrigger }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_ADDRESS = '0xfedbd76caeb345e2d1ddac06c442b86638b65bca';
  const isAdmin = account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  useEffect(() => {
    loadCampaigns();
  }, [refreshTrigger]);

  const loadCampaigns = async () => {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider('https://testnet-rpc.coinex.net');
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, provider);

      const campaignCounter = await contract.campaignCounter();
      const campaignList: Campaign[] = [];

      for (let i = 1; i <= Number(campaignCounter); i++) {
        try {
          const campaign = await contract.getCampaign(i);
          campaignList.push({
            id: Number(campaign.id),
            title: campaign.title,
            description: campaign.description,
            targetAmount: ethers.formatEther(campaign.targetAmount),
            totalRaised: ethers.formatEther(campaign.totalRaised),
            createdAt: Number(campaign.createdAt),
            isActive: campaign.isActive,
            creator: campaign.creator
          });
        } catch (err) {
          console.error(`Lỗi khi tải chiến dịch ${i}:`, err);
        }
      }

      setCampaigns(campaignList);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chiến dịch:', error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 text-lg">Chưa có chiến dịch nào</p>
        {isAdmin && (
          <p className="text-blue-400 text-sm mt-2">Bấm nút "Tạo chiến dịch mới" để bắt đầu</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
          onClick={() => onSelectCampaign(campaign)}
        >
          {/* Header */}
          <div className={`p-4 ${campaign.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                campaign.isActive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {campaign.isActive ? 'Đang mở' : 'Đã đóng'}
              </span>
              <span className="text-xs text-white/60">ID: {campaign.id}</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
              {campaign.title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Mô tả */}
            <p className="text-sm text-white/70 line-clamp-3">
              {campaign.description}
            </p>

            {/* Tiến độ */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Đã quyên góp</span>
                <span className="text-white font-bold">{parseFloat(campaign.totalRaised).toFixed(4)} CET</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${getProgress(campaign.totalRaised, campaign.targetAmount)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-white/40">{getProgress(campaign.totalRaised, campaign.targetAmount).toFixed(1)}%</span>
                <span className="text-white/60">Mục tiêu: {parseFloat(campaign.targetAmount).toFixed(0)} CET</span>
              </div>
            </div>

            {/* Action button */}
            <button className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
              campaign.isActive
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}>
              {isAdmin ? 'Quản lý' : (campaign.isActive ? 'Quyên góp ngay' : 'Đã đóng')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
