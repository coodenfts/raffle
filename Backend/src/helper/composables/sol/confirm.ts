import * as web3 from '@solana/web3.js';
import { useAnchorWallet, useWallet, useConnection, WalletContextState, AnchorWallet } from '@solana/wallet-adapter-react';

import { sleep, simulateTransaction, awaitTransactionSignatureConfirmation } from './connection';

const CONFIRM_DELAY = 90000;



const getUnixTs = () => {
  return new Date().getTime() / 1000;
};


export const confirmTx = async (tx: web3.Transaction, wallet: AnchorWallet, connection: web3.Connection) => {
  let done = false, slot = 0;

  try {
    const signedTx = await wallet?.signTransaction(tx);
    const sendTx = signedTx.serialize();
    const startTime = getUnixTs();
    const txid = await connection.sendRawTransaction(sendTx, {
      skipPreflight: true,
    });

    (async () => {
      while (!done && getUnixTs() - startTime < CONFIRM_DELAY) {
        connection.sendRawTransaction(sendTx, {
          skipPreflight: true,
        });
        await sleep(500);
      }
    })();

    try {
      const confirmation: any = await awaitTransactionSignatureConfirmation(
        txid,
        CONFIRM_DELAY,
        connection,
        "recent",
        true
      );

      if (!confirmation)
        throw new Error('Timed out awaiting confirmation on transaction');

      if (confirmation?.err) {
        console.error(`confirmation.err`, confirmation.err);
        throw new Error('Transaction failed: Custom instruction error');
      }

      slot = confirmation?.slot || 0;
    } catch (err: any) {
      console.error("Timeout Error caughted.", err);
      if (err.timeout) {
        throw new Error('Timed out awaiting confirmation on transaction');
      }

      let simulateResult: web3.SimulatedTransactionResponse | null = null;
      try {
        simulateResult = (
          await simulateTransaction(
            connection,
            web3.Transaction.from(
              Buffer.from(sendTx)
            ),
            "single")
        ).value;
      } catch (e) { }

      if (simulateResult && simulateResult.err) {
        if (simulateResult.logs) {
          for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
            const line = simulateResult.logs[i];
            if (line.startsWith("Program log: ")) {
              throw new Error(
                'Transaction failed: ' + line.slice('Program log: '.length)
              );
            }
          }
        }
        console.error(JSON.stringify(simulateResult.err));
      }
    } finally {
      done = true;
    }

  }
  catch (err) {
  }

  if (slot) return true;

  return false;
}