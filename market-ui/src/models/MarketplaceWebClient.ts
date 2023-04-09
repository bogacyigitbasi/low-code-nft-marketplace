/**
 * This file serves the purpose of using a web backend for listing for tokens.
 * Morfe functionality will be added.
 * Till now the tokens were listed using invoking the list method the Smart Contract.
 */

import { ContractAddress } from "@concordium/web-sdk";
import { WEB_TOKENS_LIST_URL } from "../Constants";
import { TokenList, TokenListItem } from "./MarketplaceTypes";

/**
 * Gets a list of Tokens available to buy.
 * @param provider Wallet Provider.
 * @param marketContractAddress Contract Address.
 * @returns List of buyable tokens.
 */
export async function list(
  marketContractAddress: ContractAddress
): Promise<TokenList> {
  const res = await fetch(
    WEB_TOKENS_LIST_URL.replace(
      ":index",
      marketContractAddress.index.toString()
    ).replace(":subindex", marketContractAddress.subindex.toString())
  );

  const resJson: any[] = await res.json();
  
  //convert to ui models
  return resJson.map((e) => ({
    ...e,
    contract: {
        index: BigInt(e.contract.index),
        subindex: BigInt(e.contract.subindex)
    },
    price: BigInt(e.price),
    quantity: BigInt(e.quantity),
    tokenId: e.token_id,
  } as TokenListItem));
}
