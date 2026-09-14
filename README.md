# ⚡ Vortex — Gaming & Digital Asset Marketplace

A production-ready full-stack eCommerce web application inspired by leading gaming and service marketplaces such as **WaveBoosts**, **Eldorado.gg**, and **G2G**.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and **Prisma ORM**.

---

## 🌟 Key Architecture & Features

### 1. ⚡ Atomic Digital Delivery Engine
- Instant key/credential provisioning inside atomic database transactions (`prisma.$transaction`).
- Guarantees zero duplicate key deliveries.
- Upon payment confirmation, keys are decrypted and delivered to the customer's **Digital Vault** (`/dashboard`) and sent with receipts.

### 2. 💬 Direct WhatsApp Ordering Flow
- Allows buyers to order directly with their **WhatsApp phone number**.
- Automatically creates an order with **`PENDING`** verification status.
- Generates a pre-filled WhatsApp message URL so the customer can chat directly with the sales desk.
- Real-time order status tracking at `/orders/[orderId]`.
- Admins can review pending WhatsApp orders and trigger **1-Click "Approve & Deliver"** to provision keys.

### 3. 💳 Multi-Gateway Checkout
- **Stripe** (Credit/Debit cards)
- **Razorpay** (UPI, Netbanking, Cards)
- **PayPal** (Global payments)
- **Crypto Payments** (USDT, BTC, Solana simulator)
- **Vortex Stored Wallet** (Instant 1-click checkout with stored balance)
- **WhatsApp Direct Order** (Pending manual review flow)

### 4. 👑 Complete Admin Console (`/admin`)
- **Executive KPIs**: Real-time Gross Revenue, Total Orders, Pending WhatsApp Orders, Active Support Tickets, and Stock Warnings.
- **Bulk Inventory Management**: Import 10, 50, or 100+ credentials/keys in bulk via CSV or multi-line text input.
- **User Moderation Desk**: 1-Click Ban, Unban, Suspend, Mute, Password Reset, Role Change, and Wallet Balance Adjustments.
- **Order Fulfillment Desk**: Review incoming orders and approve pending WhatsApp orders.
- **Support Desk**: Manage customer support tickets, internal private staff notes, and staff replies.
- **Coupons Desk**: Create discount promo codes with percentage discounts, max usages, and expiration dates.

### 5. 🔑 Customer Dashboard (`/dashboard`)
- **Digital Key Vault**: View, unmask, 1-click copy, and download `.txt` credentials.
- **Order History**: Track past and pending orders.
- **Vortex Wallet**: Check balance, view transaction ledger, and top up balance.
- **Support Desk**: Open tickets and converse with staff.

---

## 🚀 Quick Start (Local Run)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 1-Click Demo Accounts

| Role | Email | Default Password | Access |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@vortex.io` | `VortexAdmin2026!` | Full Admin Console (`/admin`) |
| **🎮 Customer** | `customer@vortex.io` | `VortexCustomer2026!` | Digital Vault & Storefront (`/dashboard`) |
| **🎧 Support** | `support@vortex.io` | `VortexAdmin2026!` | Support Desk Queue |

*Note: The top announcement bar includes 1-click demo login buttons for instant testing without typing credentials.*

---

## 🐳 Docker Production Deployment

```bash
docker-compose up -d --build
```
Runs Next.js 15 standalone container, PostgreSQL 16 database, and Nginx reverse proxy on port 80.
