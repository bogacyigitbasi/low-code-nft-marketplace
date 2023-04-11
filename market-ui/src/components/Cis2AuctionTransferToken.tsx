import { WalletApi } from "@concordium/browser-wallet-api-helpers";
import { TextField, Button } from "@mui/material";
import { ContractAddress } from "@concordium/web-sdk";
import { FormEvent, useState } from "react";

import { TransferParams } from "../models/Cis2Types";
import {
  Cis2ContractInfo,
  ContractInfo,
} from "../models/ConcordiumContractClient";
import {
  ensureSupportsCis2,
  isValidTokenId,
  transfer,
} from "../models/Cis2Client";
import DisplayError from "./ui/DisplayError";

export default function Cis2AuctionTransferToken(props: {
  provider: WalletApi;
  account: string;
  auctionContractInfo: ContractInfo;
  auctionContractAddress: ContractAddress;
  tokenContractInfo: Cis2ContractInfo;
  onDone: (
    tokenContractAddress: ContractAddress,
    tokenId: string,
    amount: number
  ) => void;
}) {
  const [state, setState] = useState({
    processing: false,
    error: "",
  });
  const [form, setForm] = useState({
    tokenId: "",
    contractIndex: BigInt(0),
    contractSubindex: BigInt(0),
    amount: "",
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ ...state, processing: true });
    if (!isValidTokenId(form.tokenId, props.tokenContractInfo)) {
      console.error(`Invalid token ID: ${form.tokenId}`);
      setState({ ...state, error: "Invalid token ID", processing: false });
      return;
    }
    const nftContractAddress = {
      index: form.contractIndex,
      subindex: form.contractSubindex,
    };
    const transferParams = [
      {
        amount: form.amount,
        token_id: form.tokenId,
        from: {
          Account: [props.account],
        },
        to: {
          Contract: [
            {
              index: Number(props.auctionContractAddress.index.toString()),
              subindex: Number(
                props.auctionContractAddress.subindex.toString()
              ),
            },
            "onReceivingCIS2",
          ],
        },
        data: "",
      },
    ] as TransferParams;
    try {
      await ensureSupportsCis2(props.provider, props.tokenContractInfo, {
        index: form.contractIndex,
        subindex: form.contractSubindex,
      });
      console.log(`supports cis2`);
      await transfer(
        props.provider,
        props.account,
        transferParams,
        nftContractAddress,
        props.tokenContractInfo
      );
      console.log(`tansfer completed`);
      props.onDone(nftContractAddress, form.tokenId, Number(form.amount));
    } catch (error: any) {
      console.error(error);
      setState({ ...state, error: error.message, processing: false });
      return;
    }
  };

  return (
    <form onSubmit={submit}>
      <TextField
        label="Token ID"
        type="text"
        variant="outlined"
        value={form.tokenId}
        onChange={(e) => setForm({ ...form, tokenId: e.target.value })}
        required
        disabled={state.processing}
      />
      <br />
      <TextField
        label="Amount"
        type="text"
        variant="outlined"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
        disabled={state.processing}
      />
      <br />
      <TextField
        label="Contract Index"
        type="number"
        variant="outlined"
        value={form.contractIndex.toString()}
        onChange={(e) =>
          setForm({ ...form, contractIndex: BigInt(e.target.value) })
        }
        required
        disabled={state.processing}
      />
      <br />
      <TextField
        label="Contract Subindex"
        type="number"
        variant="outlined"
        value={form.contractSubindex.toString()}
        onChange={(e) =>
          setForm({ ...form, contractSubindex: BigInt(e.target.value) })
        }
        required
        disabled={state.processing}
      />
      <br />
      <DisplayError error={state.error} />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={state.processing}
      >
        Submit
      </Button>
    </form>
  );
}
