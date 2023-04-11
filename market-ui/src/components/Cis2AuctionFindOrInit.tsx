import { Stack, Typography } from "@mui/material";
import { WalletApi } from "@concordium/browser-wallet-api-helpers";
import { ContractAddress } from "@concordium/web-sdk";

import { ContractInfo } from '../models/ConcordiumContractClient';
import Cis2AuctionFindInstance from "./Cis2AuctionInstance";
import Cis2AuctionInit from "./Cis2AuctionInit";

export default function Cis2AuctionFindOrInit(props: {
	provider: WalletApi;
	account: string;
	auctionContractInfo: ContractInfo;
	auctionContractAddress?: ContractAddress;
	onDone: (address: ContractAddress, contractInfo: ContractInfo) => void;
}) {
	return (
		<Stack spacing={2}>
			<Cis2AuctionFindInstance
				provider={props.provider}
				contractInfo={props.auctionContractInfo}
				address={props.auctionContractAddress}
				onDone={props.onDone}
			/>
			<Typography variant="overline">Or</Typography>
			<Cis2AuctionInit {...props} />
		</Stack>
	);
}