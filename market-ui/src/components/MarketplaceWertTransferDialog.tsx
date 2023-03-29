import { FormEvent, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { WalletApi } from "@concordium/browser-wallet-api-helpers";
import { ContractAddress } from "@concordium/web-sdk";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { TokenListItem, TransferParams } from "../models/MarketplaceTypes";
import { MethodNames } from "../models/MarketplaceClient";
import { Divider, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { MARKETPLACE_CONTRACT_INFO } from "../Constants";
import {
	serializeParams,
	toParamContractAddress,
} from "../models/ConcordiumContractClient";
import { Buffer } from "buffer/";
import { v4 as uuidv4 } from "uuid";

function toHex(obj: Record<string, unknown>) {
	return Buffer.from(JSON.stringify(obj)).toString("hex");
}
//@ts-ignore
window.Buffer = Buffer;

export default function MarketplaceWertTransferDialog(props: {
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
	}>({
		totalAmount: props.token.quantity * props.token.price,
	});

	const handleClose = () => {
		setOpen(false);
		props.onClose();
	};

	const { token: item, provider, account, marketContractAddress } = props;

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

		const { schemaBuffer, contractName } = MARKETPLACE_CONTRACT_INFO;
		const paramJson: TransferParams = {
			nft_contract_address: toParamContractAddress(item.contract),
			token_id: item.tokenId,
			to: account,
			owner: item.owner,
			quantity: quantity.toString(),
		};
		const parameter = serializeParams(
			contractName,
			schemaBuffer,
			MethodNames.transfer,
			paramJson
		);
		const privateKey =
			"0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3";
		const signedData = signSmartContractData(
			{
				address: account,
				commodity: "CCD",
				commodity_amount: parseInt(state.totalAmount.toString()), // typescript does accept this as a string
				sc_address: toHex({
					index: parseInt(marketContractAddress.index.toString()),
					subindex: parseInt(marketContractAddress.subindex.toString()),
				}),
				sc_input_data: toHex({
					entrypoint: `${contractName}.${MethodNames.transfer}`,
					params: parameter.toString("hex"),
				}),
				network: "testnet", //this is a mandatory field
				// pk_id: "key1", it is not accepted as a key in data to be signed
			},
			privateKey
		);
		const otherWidgetOptions = {
			pk_id: "key1",
			sc_id: uuidv4(), //this is the request id. Needs to be diff for every request. just keeping click_id doesnt work.
			partner_id: "01GW6YMK3WN8QY8E8MTKP6MHXX",
			container_id: "widget",
			click_id: uuidv4(), // unique id of purchase in your system. really?
			origin: "https://sandbox.wert.io",
			width: 400,
			height: 600,
			listeners: {
				loaded: () => console.log("loaded"),
			},
		};
		const wertWidget = new WertWidget({
			...signedData,
			...otherWidgetOptions,
		});
		wertWidget.mount();
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
						/>
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
