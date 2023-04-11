import { ContractAddress } from "@concordium/web-sdk";
import { ArrowBackRounded } from "@mui/icons-material";
import {
  Container,
  Grid,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  Cis2ContractInfo,
  ContractInfo,
} from "../models/ConcordiumContractClient";
import { WalletApi } from "@concordium/browser-wallet-api-helpers";
import Cis2AuctionFindOrInit from "../components/Cis2AuctionFindOrInit";
import Cis2AuctionTransferToken from "../components/Cis2AuctionTransferToken";

enum Steps {
  GetOrInitCis2AuctionContract,
  TransferAuctionToken,
}

type StepType = { step: Steps; title: string };

export default function CreateAuction(props: {
  tokenContractInfo: Cis2ContractInfo;
  provider: WalletApi;
  account: string;
  auctionContractInfo: ContractInfo;
  onDone: (
    auctionAddress: ContractAddress,
    tokenAddress: ContractAddress,
    tokenId: string
  ) => void;
}) {
  const steps: StepType[] = [
    {
      step: Steps.GetOrInitCis2AuctionContract,
      title: "Create New or Find existing Auction",
    },
    {
      step: Steps.TransferAuctionToken,
      title: "Start Auction",
    },
  ];

  let [state, setState] = useState<{
    auctionContractAddress?: ContractAddress;
    tokenContractAddress?: ContractAddress;
    tokenId?: string;
    amount?: number;
    activeStep: StepType;
  }>({
    activeStep: steps[0],
  });

  function onInit(
    auctionContractAddress: ContractAddress,
    _contractInfo: ContractInfo
  ) {
    setState({
      ...state,
      activeStep: steps[1],
      auctionContractAddress,
    });
  }

  function onTransferred(
    tokenContractAddress: ContractAddress,
    tokenId: string,
    amount: number
  ) {
    alert("transfer complete");
    setState({
      ...state,
      tokenContractAddress,
      tokenId,
      amount,
    });
  }

  function StepContent() {
    switch (state.activeStep.step) {
      case Steps.GetOrInitCis2AuctionContract:
        return (
          <Cis2AuctionFindOrInit
            provider={props.provider}
            account={props.account}
            auctionContractInfo={props.auctionContractInfo}
            auctionContractAddress={state.auctionContractAddress}
            onDone={(address, contractInfo) => onInit(address, contractInfo)}
          />
        );
      case Steps.TransferAuctionToken:
        return (
          <Cis2AuctionTransferToken
            provider={props.provider}
            account={props.account}
            auctionContractInfo={props.auctionContractInfo}
            auctionContractAddress={state.auctionContractAddress!}
            tokenContractInfo={props.tokenContractInfo}
            onDone={(tokenAddress, tokenId, amount) =>
              onTransferred(tokenAddress, tokenId, amount)
            }
          />
        );
      default:
        return <>Invalid Step</>;
    }
  }

  function goBack(): void {
    var activeStepIndex = steps.findIndex(
      (s) => s.step === state.activeStep.step
    );
    var previousStepIndex = Math.max(activeStepIndex - 1, 0);

    setState({ ...state, activeStep: steps[previousStepIndex] });
  }

  return (
    <Container sx={{ maxWidth: "xl", pt: "10px" }}>
      <Stepper
        activeStep={state.activeStep.step}
        alternativeLabel
        sx={{ padding: "20px" }}
      >
        {steps.map((step) => (
          <Step key={step.step}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Paper sx={{ padding: "20px" }} variant="outlined">
        <Grid container>
          <Grid item xs={1}>
            <IconButton
              sx={{ border: "1px solid black", borderRadius: "100px" }}
              onClick={() => goBack()}
            >
              <ArrowBackRounded></ArrowBackRounded>
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ pt: "20px", width: "100%" }}
              textAlign="center"
            >
              {state.activeStep.title}
            </Typography>
          </Grid>
        </Grid>
        <StepContent />
      </Paper>
    </Container>
  );
}
