# Hướng Dẫn Deploy Hệ Thống Chiến Dịch Mới

## 🎯 Tổng Quan

Hệ thống mới cho phép:
- Admin tạo **nhiều chiến dịch quyên góp** khác nhau
- Người dùng **chọn chiến dịch** để quyên góp
- Mỗi chiến dịch có **tổng tiền riêng**, quản lý riêng
- Giao diện **danh sách chiến dịch** như bình chọn

## 📦 Các Bước Deploy

### Bước 1: Deploy Smart Contract

Chạy lệnh sau trong terminal:

```powershell
npx hardhat run scripts/deploy-campaign.js --network coinexTestnet
```

**Lưu ý:** Lệnh này sẽ:
- Deploy contract `DonationCampaign.sol`
- Tự động tạo 1 chiến dịch mẫu "Cứu Dũng"
- In ra địa chỉ contract

### Bước 2: Cập Nhật Địa Chỉ Contract

1. Copy địa chỉ contract từ terminal (VD: `0x123abc...`)
2. Mở file: `app/utils/campaign-contract.ts`
3. Thay đổi dòng:
   ```typescript
   export const CAMPAIGN_CONTRACT_ADDRESS = '0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0';
   ```
   Thành:
   ```typescript
   export const CAMPAIGN_CONTRACT_ADDRESS = 'ĐỊA_CHỈ_MỚI_CỦA_BẠN';
   ```

### Bước 3: Chạy Ứng Dụng

```powershell
npm run dev
```

Truy cập: http://localhost:3000

## 🎨 Giao Diện Mới

### Trang Chủ
- **Danh sách chiến dịch** dạng cards/grid
- Mỗi card hiển thị:
  - Tiêu đề chiến dịch
  - Mô tả
  - Tiến độ quyên góp (progress bar)
  - Trạng thái: Đang mở / Đã đóng
  - Nút "Quyên góp" hoặc "Quản lý"

### Nút "Tạo chiến dịch mới" (Admin only)
- Hiển thị ở trên cùng
- Mở modal với form:
  - Tiêu đề chiến dịch
  - Mô tả chi tiết
  - Số tiền mục tiêu (CET)

### Khi Click Vào Chiến Dịch

**Người dùng thường:**
- Mở modal quyên góp
- Chọn số tiền
- Nút quyên góp nhanh (0.1, 0.5, 1, 5 CET)
- Quyên góp ngay

**Admin:**
- Mở modal quản lý
- Thống kê tiền quyên góp
- Nút "Đóng/Mở chiến dịch"
- Nút "Rút tiền"

## 📊 Cấu Trúc Mới

### Smart Contract: `DonationCampaign.sol`
```solidity
struct Campaign {
    uint256 id;
    string title;
    string description;
    uint256 targetAmount;
    uint256 totalRaised;
    uint256 createdAt;
    bool isActive;
    address creator;
}

// Functions:
- createCampaign(title, description, targetAmount) // Admin only
- donate(campaignId) payable // Public
- withdrawFunds(campaignId) // Admin only
- closeCampaign(campaignId) // Admin only
- openCampaign(campaignId) // Admin only
- getCampaign(campaignId) // View
- getAllDonations() // View
- getCampaignDonations(campaignId) // View
```

### Frontend Components Mới

1. **CampaignList.tsx**
   - Hiển thị grid các chiến dịch
   - Load từ blockchain
   - Click vào campaign → mở modal

2. **CreateCampaignModal.tsx**
   - Form tạo chiến dịch
   - Validation input
   - Gọi `createCampaign()` trên contract

3. **CampaignDetail.tsx**
   - Modal chi tiết chiến dịch
   - Form quyên góp (user)
   - Panel quản lý (admin)
   - Thống kê tiến độ

### Page.tsx (Cập Nhật)
- Không còn `AdminPanel` + `DonationForm` cũ
- Thay bằng:
  - Nút "Tạo chiến dịch" (admin)
  - `<CampaignList />` (tất cả user)
  - Modal tạo chiến dịch
  - Modal chi tiết chiến dịch

## ✨ Tính Năng

### Admin
✅ Tạo nhiều chiến dịch
✅ Đặt mục tiêu cho từng chiến dịch
✅ Đóng/Mở chiến dịch bất kỳ
✅ Rút tiền từng chiến dịch riêng biệt
✅ Xem thống kê từng chiến dịch

### Người Dùng
✅ Xem danh sách tất cả chiến dịch
✅ Chọn chiến dịch để quyên góp
✅ Xem tiến độ quyên góp real-time
✅ Quyên góp nhanh với các mức preset
✅ Không quyên góp được vào chiến dịch đã đóng

## 🔧 Troubleshooting

### Lỗi "Invalid campaign ID"
- Chưa tạo chiến dịch nào
- Giải pháp: Admin tạo chiến dịch đầu tiên

### Lỗi "Campaign is not active"
- Chiến dịch đã bị đóng
- Giải pháp: Admin mở lại hoặc chọn chiến dịch khác

### Contract address chưa cập nhật
- Kiểm tra file `app/utils/campaign-contract.ts`
- Đảm bảo địa chỉ đúng sau khi deploy

## 📝 Migration Notes

### Dữ Liệu Cũ
- Contract cũ `Donation.sol` vẫn còn trên blockchain
- Dữ liệu quyên góp cũ không tự động migrate
- Nếu muốn giữ lịch sử:
  1. Export data từ contract cũ
  2. Tạo chiến dịch mới
  3. Import dữ liệu (nếu cần)

### Components Cũ
- `AdminPanel.tsx` - Không dùng nữa
- `DonationForm.tsx` - Không dùng nữa (tích hợp vào CampaignDetail)

Các component khác giữ nguyên:
- `WalletConnect.tsx`
- `DonorsList.tsx` - Sẽ cần cập nhật để filter theo campaign
- `TopDonors.tsx` - Sẽ cần cập nhật để filter theo campaign

## 🚀 Next Steps

Sau khi deploy thành công:
1. Tạo chiến dịch đầu tiên qua UI
2. Test quyên góp vào chiến dịch
3. Test đóng/mở chiến dịch
4. Test rút tiền
5. Cập nhật `DonorsList` và `TopDonors` để filter theo campaign (nếu cần)

---

**Lưu ý quan trọng:** 
- Contract address mới sẽ khác contract cũ
- Cần thông báo cho người dùng về hệ thống mới
- Admin address vẫn là: `0xfedbd76caeb345e2d1ddac06c442b86638b65bca`
