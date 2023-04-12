use concordium_std::{AccountAddress, SchemaType, Serial, Timestamp};

use crate::state::{AuctionState, ParticipationTokenIdentifier};

#[derive(Debug, Serial, SchemaType)]
pub struct AuctionUpdatedEvent {
    pub auction_state: AuctionState,
    /// The highest bidder so far; The variant `None` represents
    /// that no bidder has taken part in the auction yet.
    pub highest_bidder: Option<AccountAddress>,
    /// The minimum accepted raise to over bid the current bidder in Euro cent.
    pub minimum_raise: u64,
    /// Time when auction ends (to be displayed by the front-end)
    pub end: Timestamp,
    pub start: Timestamp,
    /// Token needed to participate in the Auction
    pub participation_token: Option<ParticipationTokenIdentifier>,
    pub highest_bid: u64,
}

#[derive(Debug, SchemaType, Serial)]
pub enum AuctionEvent {
    AuctionUpdated(AuctionUpdatedEvent),
    ParticipantAdded(AccountAddress)
}
