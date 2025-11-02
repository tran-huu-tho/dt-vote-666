# 🚀 HƯỚNG DẪN DEPLOY NHANH

## Bạn cần làm 3 bước:

### Bước 1: Deploy Contract
Mở terminal mới và chạy:
```powershell
npx hardhat run scripts/deploy-simple.js --network coinexTestnet
```

Đợi 30-60 giây để deploy xong.

### Bước 2: Copy địa chỉ Contract
Khi thấy output kiểu:
```
✅ Contract deployed successfully!
📍 Address: 0x1234567890abcdef...
```

Copy địa chỉ đó (bắt đầu bằng 0x...)

### Bước 3: Cập nhật địa chỉ
Mở file: `app/utils/campaign-contract.ts`

Thay dòng này:
```typescript
export const CAMPAIGN_CONTRACT_ADDRESS = '0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0';
```

Thành:
```typescript
export const CAMPAIGN_CONTRACT_ADDRESS = 'ĐỊA_CHỈ_MỚI_CỦA_BẠN';
```

## Xong! 

Refresh trang web (Ctrl + R) và bạn sẽ thấy:
- Danh sách chiến dịch ở trang chủ
- Chiến dịch mẫu "Cứu Dũng" đã được tạo sẵn
- Click vào chiến dịch để quản lý/quyên góp

---

## Nếu gặp lỗi:

### Lỗi "Cannot find contract"
- Contract chưa deploy xong, đợi thêm 30 giây

### Lỗi "Invalid address"
- Địa chỉ copy chưa đúng, phải bắt đầu bằng `0x`

### Lỗi "Transaction reverted"
- Ví chưa đủ tiền gas
- Hoặc contract chưa được verify

## Cần giúp?
Gọi tôi và gửi screenshot lỗi!
