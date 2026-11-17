# Medlar — Premium Travel Bags (MERN)

```
backend/   Express + MongoDB (MVC: src/models, controllers, router, services, dao, middlewares, validator)
frontend/  React + Vite + Redux Toolkit + Tailwind v4
```
(`backend/server.py` and `backend/requirements.txt` are only used by the Emergent preview proxy — ignore them locally.)

## Run on Windows (VS Code)

Requirements: Node.js 20+ (https://nodejs.org) and either MongoDB Community Server running locally or a MongoDB Atlas URI.

Open the project folder in VS Code, then open two terminals (Terminal → New Terminal).

**Terminal 1 — backend**
```powershell
cd backend
copy .env.example .env      # then fill in your keys in .env
npm install
npm run dev                 # http://localhost:3000
```

**Terminal 2 — frontend**
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173.

On first start the backend seeds categories, sample products, the seller account and a test buyer (only into an empty database):
- Seller: `waisshaikh394@gmail.com` / value of `SEED_SELLER_PASSWORD` → `/seller`
- Buyer: `buyer@medlar.test` / value of `SEED_BUYER_PASSWORD`

## Keys (backend/.env)
- **Razorpay**: test Key ID (`rzp_test_...`) and secret. Webhook URL: `<your backend>/api/payment/webhook` (events: payment.captured, order.paid, payment.failed).
- **Cloudinary**: cloud name, API key and secret (the key needs upload permission).
- **Google OAuth** (optional): add `http://localhost:3000/api/auth/google/callback` as an authorised redirect URI.
