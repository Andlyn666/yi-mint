module yi_jing_nft::yi_jing_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use std::string::{Self, String};
    use sui::event;

    /// An error occurred when the hexagram number is not valid (must be 1-64)
    const EInvalidHexagramNumber: u64 = 0;

    /// Yi Jing NFT structure
    struct YiJingNFT has key, store {
        id: UID,
        /// Name of the NFT
        name: String,
        /// Description of the NFT
        description: String,
        /// URL to the NFT image
        image_url: Url,
        /// Hexagram number (1-64)
        hexagram_number: u64,
        /// Hexagram name in Chinese
        hexagram_name: String,
        /// Question asked during divination
        question: String,
        /// Creator address
        creator: address,
    }

    /// Event emitted when a new Yi Jing NFT is minted
    struct MintNFTEvent has copy, drop {
        /// Object ID of the minted NFT
        object_id: address,
        /// Name of the NFT
        name: String,
        /// Hexagram number
        hexagram_number: u64,
        /// Creator address
        creator: address,
        /// Owner address
        owner: address,
    }

    /// Create a new Yi Jing NFT
    public entry fun mint(
        name: String,
        description: String,
        image_url: String,
        hexagram_number: u64,
        hexagram_name: String,
        question: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Ensure hexagram number is valid (1-64)
        assert!(hexagram_number >= 1 && hexagram_number <= 64, EInvalidHexagramNumber);

        // Convert image_url to Url type
        let image_url = url::new_unsafe(string::to_ascii(image_url));

        // Create a new Yi Jing NFT
        let nft = YiJingNFT {
            id: object::new(ctx),
            name,
            description,
            image_url,
            hexagram_number,
            hexagram_name,
            question,
            creator: tx_context::sender(ctx),
        };

        // Emit mint event
        event::emit(MintNFTEvent {
            object_id: object::uid_to_address(&nft.id),
            name: nft.name,
            hexagram_number: nft.hexagram_number,
            creator: nft.creator,
            owner: recipient,
        });

        // Transfer the NFT to the recipient
        transfer::transfer(nft, recipient);
    }
} 