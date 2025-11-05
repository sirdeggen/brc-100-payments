# BRC-100 Payments Demo

This application demonstrates BRC-100 wallet payment methods using the BSV SDK.

## Features

The app includes examples of:

- **Identity-based payments**: Send and receive payments using identity keys via MessageBox
- **Address-based payments**: Generate addresses and internalize transactions 
- **Payment verification**: Fetch, verify, and internalize transactions from the blockchain

## Usage

First, install dependencies:

```bash
npm i
```

**Note:** This project requires `tsx` to be installed globally. If you don't have it installed, run:

```bash
npm install -g tsx
```

Then run the development server:

```bash
npm run dev
```

## Step-by-Step Guide

The application includes 4 demo steps you can run sequentially:

### Step 1: Generate a BRC-100 Wallet Address

```bash
tsx index.ts 1
```

This generates a wallet address associated with your BRC-100 wallet.

### Step 2: Internalize an Address-Based Transaction

```bash
tsx index.ts 2 <txid>
```

Example:
```bash
tsx index.ts 2 cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe
```

This fetches a transaction by ID, verifies it, and internalizes it as a payment.

### Step 3: Create Identity-Based Payment

The email address must be registered on the identity overlay using [Social Cert](https://socialcert.net) for the example to work.
```bash
tsx index.ts 3 <email> <satoshis>
```

Example:
```bash
tsx index.ts 3 test@deggen.com 1000
```

This creates and sends an identity-based payment to a recipient via MessageBox.

### Step 4: Accept Identity-Based Payment

```bash
tsx index.ts 4
```

**Note:** Switch to the receiving side before running this last step. This retrieves and accepts incoming identity-based payments from MessageBox if you are running the wallet with the keys associated with the email used in step 3.

## Key Functions

- `getAddress()` - Generate a BRC-100 wallet address
- `createOutboundTxToIdentity()` - Create identity-based payment to a recipient
- `acceptIdentityBasedPayment()` - Accept incoming identity-based payments from MessageBox
- `internalizeATransaction()` - Internalize and verify address-based payments
