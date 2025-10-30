'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COINEX_TESTNET_CONFIG } from '../utils/contract';

interface Donor {
  address: string;
  amount: string;
  timestamp: number;
}

interface DonorsListProps {
  refreshTrigger: number;
}

export default function DonorsList({ refreshTrigger }: DonorsListProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [totalDonations, setTotalDonations] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDonors();
  }, [refreshTrigger]);

  const loadDonors = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = new ethers.JsonRpcProvider(COINEX_TESTNET_CONFIG.rpcUrls[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Lấy tổng số tiền quyên góp
      try {
        const total = await contract.totalDonations();
        const totalFormatted = ethers.formatEther(total);
        setTotalDonations(totalFormatted);
      } catch (err) {
        console.error('Error reading totalDonations:', err);
        setTotalDonations('0');
      }

      // Lấy danh sách người quyên góp
      try {
        const donorsData = await contract.getAllDonors();
        
        const formattedDonors = donorsData.map((donor: any) => ({
          address: donor.donorAddress,
          amount: ethers.formatEther(donor.amount),
          timestamp: Number(donor.timestamp),
        }));

        // Sắp xếp theo thời gian mới nhất
        formattedDonors.sort((a: Donor, b: Donor) => b.timestamp - a.timestamp);
        
        setDonors(formattedDonors);
      } catch (err) {
        console.error('Error reading donors:', err);
        setDonors([]);
      }
    } catch (error: any) {
      console.error('Error loading donors:', error);
      setError('Không thể kết nối với blockchain. Vui lòng kiểm tra mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Danh sách quyên góp</h2>
              <p className="text-sm text-blue-100">Minh bạch và công khai</p>
            </div>
            <button
              onClick={loadDonors}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-5 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1 font-semibold">Tổng quyên góp</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-600">
                  {parseFloat(totalDonations).toFixed(4)}
                </p>
                <span className="text-lg font-semibold text-gray-600">CET</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1 font-semibold">Số lượt đóng góp</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-green-600">
                  {donors.length}
                </p>
                <span className="text-lg font-semibold text-gray-600">lượt</span>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-5">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold mb-2">⚠️ Chưa có Smart Contract</p>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-700">
                <p className="font-semibold mb-2">📝 Để sử dụng ứng dụng:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Deploy smart contract lên CoinEx Testnet</li>
                  <li>Cập nhật contract address vào code</li>
                  <li>Kết nối MetaMask và bắt đầu quyên góp</li>
                </ol>
                <p className="mt-3 text-xs text-gray-600">
                  Xem chi tiết trong file: <code className="bg-gray-100 px-1 rounded">DEPLOY_CONTRACT.md</code>
                </p>
              </div>
              <button
                onClick={loadDonors}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-gray-600 mt-4 font-medium">Đang tải dữ liệu từ blockchain...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium text-lg">Chưa có ai quyên góp</p>
              <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên quyên góp!</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-bold text-sm text-gray-700 w-16">STT</th>
                      <th className="text-left py-3 px-4 font-bold text-sm text-gray-700">Địa chỉ ví</th>
                      <th className="text-right py-3 px-4 font-bold text-sm text-gray-700 w-40">Số tiền (CET)</th>
                      <th className="text-right py-3 px-4 font-bold text-sm text-gray-700 w-48">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg text-sm font-bold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={`${COINEX_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${donor.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            title={donor.address}
                          >
                            {shortenAddress(donor.address)}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                            {parseFloat(donor.amount).toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600 font-medium">
                          {formatDate(donor.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
