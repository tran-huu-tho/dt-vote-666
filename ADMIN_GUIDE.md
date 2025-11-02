# Hướng Dẫn Sử Dụng Admin Panel

## Tài Khoản Admin
Địa chỉ: `0xfedbd76caeb345e2d1ddac06c442b86638b65bca`

## Các Chức Năng Admin

### 1. 📝 Ghi Chú Chiến Dịch
- Nhập mục đích quyên góp (VD: Cứu trợ lũ lụt, Học bổng sinh viên...)
- Click "💾 Lưu ghi chú"
- Ghi chú sẽ hiển thị cho tất cả người dùng trên trang chủ

### 2. 🔒 Đóng/Mở Quyên Góp
- Click "🔒 Đóng quyên góp" để dừng nhận quyên góp
- Click "🔓 Mở lại quyên góp" để tiếp tục
- Khi đóng: Người dùng không thể quyên góp nữa

### 3. 💸 Rút Tiền Về Tài Khoản
- Xem tổng số tiền trong quỹ
- Click "💸 Rút XXX CET"
- Xác nhận giao dịch trong MetaMask
- Tiền sẽ được chuyển về địa chỉ admin

### 4. 📊 Thống Kê
- **Tổng tiền trong quỹ**: Số CET hiện có trong smart contract
- **Trạng thái chiến dịch**: Đang mở (xanh) hoặc Đã đóng (đỏ)

## Cách Truy Cập

1. Kết nối MetaMask với địa chỉ admin: `0xfedbd76caeb345e2d1ddac06c442b86638b65bca`
2. Vào tab "Trang chủ"
3. Bảng điều khiển Admin sẽ xuất hiện ở đầu trang (chỉ admin mới thấy)

## Lưu Ý

- ⚠️ Chỉ địa chỉ admin mới thấy bảng điều khiển
- ⚠️ Các tài khoản khác vẫn sử dụng bình thường
- ⚠️ Ghi chú và trạng thái được lưu trong localStorage (local)
- ⚠️ Chức năng rút tiền gọi trực tiếp smart contract (on-chain)

## Thông Báo

Khi rút tiền thành công, hệ thống sẽ hiển thị:
```
✅ Đã rút XXX CET về tài khoản thành công!
Transaction hash: 0x...
```

## Smart Contract

- **Contract Address**: `0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0`
- **Network**: CoinEx Smart Chain Testnet (Chain ID: 53)
- **Function**: `withdraw()` - Chỉ owner mới được gọi
