import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { v4 as uuidv4 } from "uuid";
import { WERT_NETWORK, WERT_PRIVATE_KEY, WERT_PARTNER_ID, WERT_ORIGIN, MARKETPLACE_CONTRACT_INFO } from "../Constants";
import { MethodNames } from "./MarketplaceClient";
import { ContractAddress } from "@concordium/web-sdk";
import { serializeParams, toParamContractAddress } from "./ConcordiumContractClient";
import { TransferParams } from "./MarketplaceTypes";
import { Buffer } from "buffer/";
//@ts-ignore
window.Buffer = Buffer;

export interface WertOptions {
    width: number,
    height: number,
    containerId: string,
}

const toHex = (obj: Record<string, unknown>) => {
    return Buffer.from(JSON.stringify(obj)).toString("hex");
}

export const transfer = async (
    account: string,
    marketContractAddress: ContractAddress,
    nftContractAddress: ContractAddress,
    tokenId: string,
    owner: string,
    quantity: bigint,
    totalPaymentCcd: bigint,
    containerId: string = "widget",
    width: number = 400,
    height: number = 600,
) => {
    return new Promise((res, rej) => {
        const paramJson: TransferParams = {
            nft_contract_address: toParamContractAddress(nftContractAddress),
            token_id: tokenId,
            to: account,
            owner: owner,
            quantity: quantity.toString(),
        };
        const parameter = serializeParams(
            MARKETPLACE_CONTRACT_INFO.contractName,
            MARKETPLACE_CONTRACT_INFO.schemaBuffer,
            MethodNames.transfer,
            paramJson
        );
        const signedData = signSmartContractData(
            {
                address: account,
                commodity: "CCD",
                commodity_amount: parseInt(totalPaymentCcd.toString()), // typescript does accept this as a string
                sc_address: toHex({
                    index: parseInt(marketContractAddress.index.toString()),
                    subindex: parseInt(marketContractAddress.subindex.toString()),
                }),
                sc_input_data: toHex({
                    entrypoint: `${MARKETPLACE_CONTRACT_INFO.contractName}.${MethodNames.transfer}`,
                    params: parameter.toString("hex"),
                }),
                network: WERT_NETWORK,
            },
            WERT_PRIVATE_KEY
        );
        const otherWidgetOptions = {
            pk_id: "key1",
            sc_id: uuidv4(), //this is the request id. Needs to be diff for every request. just keeping click_id doesnt work.
            partner_id: WERT_PARTNER_ID,
            container_id: containerId,
            click_id: uuidv4(), // unique id of purchase in your system. really?
            origin: WERT_ORIGIN,
            width,
            height,
            listeners: {
                close: () => { console.log('close'); res(true); },
                error: (err: { name: string, message: string }) => {
                    console.error('error', err);
                    rej(err);
                },
                loaded: () => { console.log('loaded') },
                'payment-status': (status: {
                    status: string,
                    payment_id: string,
                    order_id: string,
                    tx_id: string
                }) => { console.log('payment-status', status); },
                position: (pos: { step: string }) => {
                    console.log('position', pos);
                }
            },
        };

        const wertWidget = new WertWidget({
            ...signedData,
            ...otherWidgetOptions,
        });
        wertWidget.mount();
    });

}