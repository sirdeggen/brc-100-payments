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

## Key Functions

- `getAddress()` - Generate a BRC-100 wallet address
- `createOutboundTxToIdentity()` - Create identity-based payment to a recipient
- `acceptIdentityBasedPayment()` - Accept incoming identity-based payments from MessageBox
- `internalizeATransaction()` - Internalize and verify address-based payments
