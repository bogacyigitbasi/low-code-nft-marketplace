import { FormEvent, useState } from "react";
import { SmartContractParameters, WalletApi } from "@concordium/browser-wallet-api-helpers";
import { ContractAddress } from "@concordium/web-sdk";
import { Typography, Button, Stack, TextField, Checkbox, FormControlLabel } from "@mui/material";

import { ContractInfo, initContract } from "../models/ConcordiumContractClient";
import moment from "moment";

export default function Cis2AuctionInit(props: {
	provider: WalletApi;
	account: string;
	auctionContractInfo: ContractInfo;
	onDone: (address: ContractAddress, contractInfo: ContractInfo) => void;
}) {
	const [state, setState] = useState({
		error: "",
		processing: false,
	});
	const [start, setStart] = useState('');
	const [end, setEnd] = useState('');
	const [minimumRaise, setMinimumRaise] = useState(0);
	const [includeParticipationToken, setIncludeParticipationToken] = useState(false);
	const [participationToken, setParticipationToken] = useState({
		contract: { index: 0, subindex: 0 },
		token_id: '',
	});

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		console.log({ start, end, minimumRaise, participationToken });
		setState({ ...state, processing: true });
		const contractParams: SmartContractParameters = {
			start: moment(new Date(start)).utc().toISOString(),
			end: moment(new Date(end)).utc().toISOString(),
			minimum_raise: minimumRaise,
			participation_token: includeParticipationToken ? {
				Some: [{
					contract: { index: participationToken.contract.index, subindex: participationToken.contract.subindex },
					token_id: participationToken.token_id
				}]
			} : { None: [] }
		} as SmartContractParameters;
		console.log(contractParams);
		initContract(props.provider, props.auctionContractInfo, props.account, contractParams)
			.then((address) => {
				setState({ ...state, processing: false });
				props.onDone(address, props.auctionContractInfo);
			})
			.catch((err: Error) => {
				setState({ ...state, processing: false, error: err.message });
			});
	}

	return (
		<Stack component={"form"} spacing={2} onSubmit={submit}>
			<TextField
				id="start"
				label="Start Time"
				name="start"
				type="datetime-local"
				variant="outlined"
				InputLabelProps={{
					shrink: true,
				}}
				value={start}
				onChange={(date) => setStart(date.target.value)}
				required
			/>
			<br />
			<TextField
				id="start"
				label="End Time"
				name="start"
				type="datetime-local"
				variant="outlined"
				InputLabelProps={{
					shrink: true,
				}}
				value={end}
				onChange={(date) => setEnd(date.target.value)}
				required
			/>
			<br />
			<TextField
				label="Minimum Raise (Euro Cent)"
				type="number"
				variant="outlined"
				value={minimumRaise}
				onChange={(e) => setMinimumRaise(Number(e.target.value))}
				required
			/>
			<br />
			<FormControlLabel
				control={
					<Checkbox
						checked={includeParticipationToken}
						onChange={(e) => setIncludeParticipationToken(e.target.checked)}
					/>
				}
				label="Include Participation Token"
			/>
			{includeParticipationToken && (
				<>
					<TextField
						label="Participation Token Contract Index"
						type="number"
						variant="outlined"
						value={participationToken.contract.index}
						onChange={(e) =>
							setParticipationToken({
								...participationToken,
								contract: { ...participationToken.contract, index: Number(e.target.value) },
							})
						}
						required
					/>
					<br />
					<TextField
						label="Participation Token Contract Subindex"
						type="number"
						variant="outlined"
						value={participationToken.contract.subindex}
						onChange={(e) =>
							setParticipationToken({
								...participationToken,
								contract: { ...participationToken.contract, subindex: Number(e.target.value) },
							})
						}
						required
					/>
					<br />
					<TextField
						label="Participation Token ID"
						type="text"
						variant="outlined"
						value={participationToken.token_id}
						onChange={(e) =>
							setParticipationToken({ ...participationToken, token_id: e.target.value })
						}
						required
					/>
					<br />
				</>
			)}
			{state.error && (
				<Typography component="div" color="error" variant="body1">
					{state.error}
				</Typography>
			)}
			{state.processing && (
				<Typography component="div" variant="body1">
					Deploying..
				</Typography>
			)}
			<Button variant="contained" disabled={state.processing} type="submit">
				Deploy New
			</Button>
		</Stack>
	);
}