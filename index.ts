import { WalletClient, PublicKey, PrivateKey, WalletProtocol, Transaction, Utils, IdentityClient, P2PKH } from "@bsv/sdk"
import { MessageBoxClient, PeerPayClient } from "@bsv/message-box-client"
const brc29ProtocolID: WalletProtocol = [2, '3241645161d8']

async function getTx(txid: string) {
    const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/beef`)
    const data = await response.text()
    return Transaction.fromHexBEEF(data)
}

// 1. go check the message box
// 2. parse the message
// 3. internalize the transaction
// 4. acknowledge the message
async function acceptIdentityBasedPayment(wallet: WalletClient) {
    const mbc = new MessageBoxClient({
        host: 'https://messagebox.babbage.systems',
        walletClient: wallet,
    })

    const messages = await mbc.listMessages({
        messageBox: 'custom codealong',
    })

    console.log({ messages })

    const {
        body,
        messageId
    } = messages[0]

    const {
            tx,
            senderIdentityKey,
            derivationPrefix,
            derivationSuffix,
        } = body as unknown as {
            tx: number[],
            senderIdentityKey: string,
            derivationPrefix: string,
            derivationSuffix: string,
        }

    console.log({ senderIdentityKey,
            derivationPrefix,
            derivationSuffix, messageId })

    const internalizeResponse = await wallet.internalizeAction({
        description: 'identity based payment',
        tx,
        outputs: [{
            outputIndex: 0,
            protocol: 'wallet payment',
            paymentRemittance: {
                derivationPrefix,
                derivationSuffix,
                senderIdentityKey,
            }
        }]
    })

    console.log({ internalizeResponse })

    if (!internalizeResponse.accepted) throw new Error('Transaction not accepted')

    const acknowledgeResponse = await mbc.acknowledgeMessage({
        messageIds: [messageId],
    })

    console.log({ acknowledgeResponse })
}

// 1. lookup an identityKey for the given handle
// 2. calculate a publicKey for the payment
// 3. create a transaction
// 4. deliver the tx to the recipient somehow
async function createOutboundTxToIdentity(wallet: WalletClient, handle: string, satoshis: number) {
    const id = new IdentityClient(wallet)
    const response = await id.resolveByAttributes({
        attributes: {
            email: handle,
        }
    })
    const counterparty = response[0].identityKey
    const derivationPrefix = Utils.toBase64(Utils.toArray('something', 'utf8'))
    const derivationSuffix = Utils.toBase64(Utils.toArray('memorable', 'utf8'))

    const { publicKey } = await wallet.getPublicKey({
        protocolID: brc29ProtocolID,
        keyID: derivationPrefix + ' ' + derivationSuffix,
        counterparty,
    })

    const address = PublicKey.fromString(publicKey).toAddress()

    const createActionResponse = await wallet.createAction({
        description: 'identity based payment',
        outputs: [{
            outputDescription: 'payment to test account',
            satoshis,
            lockingScript: new P2PKH().lock(address).toHex(),            
        }]
    })

    console.log({ createActionResponse })

    const { publicKey: senderIdentityKey } = await wallet.getPublicKey({
        identityKey: true,
    })

    const payment = {
        tx: createActionResponse.tx,
        senderIdentityKey,
        derivationPrefix,
        derivationSuffix,
    }

    const messageBoxClient = new MessageBoxClient({
        host: 'https://messagebox.babbage.systems',
        walletClient: wallet,
    })

    const messageBoxResponse = await messageBoxClient.sendMessage({
        recipient: counterparty,
        messageBox: 'custom codealong',
        body: payment,
    })

    console.log({ messageBoxResponse })

}

// 1. go get the tx which pays to that address
// 2. verify it
// 3. internalize it
async function internalizeATransaction(wallet: WalletClient, txid: string) {
    const tx = await getTx(txid)
    const valid = await tx.verify()
    console.log({ valid })
    if (!valid) throw new Error('Invalid transaction')

    const atomicBEEF = tx.toAtomicBEEF()

    const derivationPrefix = Utils.toBase64(Utils.toArray('keyID', 'utf8'))
    const derivationSuffix = Utils.toBase64(Utils.toArray('somethingIwontforget', 'utf8'))

    const internalizedAction = await wallet.internalizeAction({
        description: 'demo codealong address based payments',
        tx: atomicBEEF,
        outputs: [{
            outputIndex: 0,
            protocol: 'wallet payment',
            paymentRemittance: {
                derivationPrefix,
                derivationSuffix,
                senderIdentityKey: new PrivateKey(1).toPublicKey().toString(),
            }
        }]
    })

    console.log({ internalizedAction })
}

// generate an address associated with our BRC-100 Wallet
async function getAddress(wallet: WalletClient) {

    const derivationPrefix = Utils.toBase64(Utils.toArray('keyID', 'utf8'))
    const derivationSuffix = Utils.toBase64(Utils.toArray('somethingIwontforget', 'utf8'))

    const { publicKey } = await wallet.getPublicKey({
        protocolID: brc29ProtocolID,
        keyID: derivationPrefix + ' ' + derivationSuffix,
        counterparty: 'anyone',
        forSelf: true,
    })

    const address = PublicKey.fromString(publicKey).toAddress()
    console.log({ address })
}

// run something
async function main() {
    const wallet = new WalletClient('json-api', 'deggen.com')
    
    await getAddress(wallet)
    // await internalizeATransaction(wallet, 'e6dac127847e5adfe220a0fa52514c482639abacfb8f9b112d197a0d5d39db3c')
    // await createOutboundTxToIdentity(wallet, 'test@deggen.com', 1000)
    // await acceptIdentityBasedPayment(wallet)
}

main()

