// src/lib/hedera.ts

import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  Hbar
} from "@hashgraph/sdk";

// Initialize Hedera client
let client: Client | null = null;

export function getHederaClient(): Client {
  if (client) return client;

  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!);

  client = Client.forTestnet().setOperator(operatorId, operatorKey);
  
  return client;
}

// Create NFT collection for an event
export async function createTicketCollection(eventName: string, maxSupply: number) {
  const client = getHederaClient();
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!);

  try {
    const transaction = await new TokenCreateTransaction()
      .setTokenName(`${eventName} Tickets`)
      .setTokenSymbol("TIX")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(maxSupply)
      .setTreasuryAccountId(operatorId)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .freezeWith(client);

    const signedTx = await transaction.sign(operatorKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    return receipt.tokenId!.toString();
  } catch (error) {
    console.error('Error creating token collection:', error);
    throw error;
  }
}

// Mint individual NFT ticket
export async function mintTicket(
  tokenId: string,
  metadata: Record<string, any>
) {
  const client = getHederaClient();
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!);

  try {
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBuffer])
      .freezeWith(client);

    const signedTx = await mintTx.sign(operatorKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
      tokenId,
      serialNumber: receipt.serials[0].toString()
    };
  } catch (error) {
    console.error('Error minting ticket:', error);
    throw error;
  }
}

// Transfer NFT to buyer
export async function transferTicket(
  tokenId: string,
  serialNumber: string,
  recipientAccountId: string
) {
  const client = getHederaClient();
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!);

  try {
    const transferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, Number(serialNumber), operatorId, recipientAccountId)
      .freezeWith(client);

    const signedTx = await transferTx.sign(operatorKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    return receipt.status.toString();
  } catch (error) {
    console.error('Error transferring ticket:', error);
    throw error;
  }
}