import { FormEvent, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { WalletApi } from "@concordium/browser-wallet-api-helpers";
import { ContractAddress } from "@concordium/web-sdk";

import { TokenListItem } from "../models/MarketplaceTypes";
import { Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Select, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { transfer as transferWert } from "../models/WertClient";
import { transfer as transferWallet } from "../models/MarketplaceClient";

export default function MarketplaceTransferDialog(props: {
	isOpen: boolean;
	token: TokenListItem;
	provider: WalletApi;
	account: string;
	marketContractAddress: ContractAddress;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(props.isOpen);
	const [state, setState] = useState<{
		isBought?: boolean;
		isBeingBought?: boolean;
		error?: string;
		totalAmount: bigint;
		paymentType: string
	}>({
		totalAmount: props.token.quantity * props.token.price,
		paymentType: 'wallet'
	});

	const handleClose = () => {
		setOpen(false);
		props.onClose();
	};

	const { token: item, provider, account, marketContractAddress } = props;
	const transfer = (quantity: bigint) => {
		switch (state.paymentType) {
			case 'wallet':
				return transferWallet(
					provider,
					account,
					marketContractAddress,
					item.contract,
					item.tokenId,
					item.owner,
					quantity,
					state.totalAmount
				);
			case 'wert':
				return transferWert(
					account,
					marketContractAddress,
					item.contract,
					item.tokenId,
					item.owner,
					quantity,
					state.totalAmount,
					'widget'
				);
			default:
				return Promise.reject({ message: "Invalid Payment Type" })
		}
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const quantity = BigInt(formData.get("quantity")?.toString() || "0");

		if (!quantity || quantity > item.quantity || quantity <= 0) {
			setState({ ...state, error: "Invalid Quantity" });
			return;
		}

		setState({
			...state,
			isBought: false,
			isBeingBought: true,
			error: "",
		});

		transfer(quantity)
			.then((_) => {
				setState({
					...state,
					isBought: true,
					isBeingBought: false,
					error: "",
				});
			})
			.catch((err) => {
				setState({
					...state,
					isBought: false,
					isBeingBought: false,
					error: err.message,
				});
			});
	}

	const handleQuantityChanged = (value: bigint) => {
		if (value && value > 0 && value <= props.token.quantity) {
			setState({ ...state, totalAmount: value * item.price });
		} else {
			setState({ ...state, totalAmount: BigInt(0) });
		}
	};

	return (
		<Container>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Buy Token: {props.token.tokenId}</DialogTitle>
				<form onSubmit={(e) => submit(e)}>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							id="quantity"
							label={`Quantity (Max ${props.token.quantity})`}
							type="number"
							name="quantity"
							fullWidth
							variant="standard"
							defaultValue={props.token.quantity.toString()}
							onChange={(e) => handleQuantityChanged(BigInt(e.target.value))}
							disabled={state.isBought || state.isBeingBought}
						/>
						<br />
						<br />
						<FormControl>
							<FormLabel id="demo-radio-buttons-group-label">Payment Via?</FormLabel>
							<RadioGroup
								aria-labelledby="demo-radio-buttons-group-label"
								defaultValue="female"
								name="radio-buttons-group"
							>
								<FormControlLabel
									value="wallet"
									control={<Radio
										onChange={e => setState({ ...state, paymentType: e.target.value })}
										disabled={state.isBought || state.isBeingBought}
									/>}
									label="Wallet" />
								<FormControlLabel
									value="wert"
									control={<Radio
										onChange={e => setState({ ...state, paymentType: e.target.value })}
										disabled={state.isBought || state.isBeingBought}
									/>}
									label="Wert" />
							</RadioGroup>
						</FormControl>
						{state.error && (
							<Typography component="div" color="error">
								{state.error}
							</Typography>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>
							{state.isBought ? "Ok" : "Cancel"}
						</Button>
						<Button
							type="submit"
							disabled={state.isBought || state.isBeingBought}
						>
							Buy{" "}
							{state.totalAmount
								? `(${state.totalAmount?.toString()} CCD)`
								: ""}
						</Button>
					</DialogActions>
				</form>
				<Divider />
				<div id="widget"></div>
			</Dialog>
		</Container>
	);
}
