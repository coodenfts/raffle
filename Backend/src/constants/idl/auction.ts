export type Auction = {
  "version": "0.1.0",
  "name": "auction",
  "instructions": [
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionId",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "u32"
        },
        {
          "name": "endTime",
          "type": "u32"
        },
        {
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "bidIncrement",
          "type": "u64"
        },
        {
          "name": "minNftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "editAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "u32"
        },
        {
          "name": "endTime",
          "type": "u32"
        },
        {
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "bidIncrement",
          "type": "u64"
        },
        {
          "name": "minNftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "deleteAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "nftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "updateBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
         "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "nftCount",
          "type": "u32"
        }
      ]
   },
    {
      "name": "cancelBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendBackNft",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendBackFt",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setWinner",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auctionId",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "startTime",
            "type": "u32"
          },
          {
            "name": "endTime",
            "type": "u32"
          },
          {
            "name": "minPrice",
            "type": "u64"
          },
          {
            "name": "bidIncrement",
            "type": "u64"
          },
          {
            "name": "bids",
            "type": {
              "array": [
                {
                  "defined": "Bid"
                },
                100
              ]
            }
          },
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "state",
            "type": "u32"
          },
          {
            "name": "minNftCount",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Bid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "u32"
          },
          {
            "name": "isWinner",
            "type": "u32"
          }
        ]
      }
   }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Bid price must be bigger than min price"
    },
    {
      "code": 6001,
      "name": "InvalidNft",
      "msg": "Invalid Nft"
    },
    {
      "code": 6002,
      "name": "OutOfAuction",
      "msg": "Auction had finished or not exist"
    },
    {
      "code": 6003,
      "name": "NotFinishAuction",
      "msg": "Auction isn't finished"
    },
    {
      "code": 6004,
      "name": "OverMaxCount",
      "msg": "Over max count"
    },
    {
      "code": 6005,
      "name": "CreateBidError",
      "msg": "Error in crate bid"
    },
    {
      "code": 6006,
      "name": "UpdateBidError",
      "msg": "Error in update bid"
    },
    {
      "code": 6007,
      "name": "CancelBidError",
      "msg": "Error in cancel bid"
    },
    {
      "code": 6008,
      "name": "ClaimBidError",
      "msg": "Error in claim bid"
    },
   {
      "code": 6009,
      "name": "AlreadyClaimed",
      "msg": "Already claimed"
    },
    {
      "code": 6010,
      "name": "AlreadyClaimedPrize",
      "msg": "Already claimed prize"
    },
    {
      "code": 6011,
      "name": "NotWinner",
      "msg": "Not winner"
    },
    {
      "code": 6012,
      "name": "ClaimPrizeError",
      "msg": "Error in claim prize"
    },
    {
      "code": 6013,
      "name": "SetWinnerError",
      "msg": "Error in set winner"
    },
    {
      "code": 6014,
      "name": "StartedAuction",
      "msg": "Auction already started"
    },
    {
      "code": 6015,
      "name": "InsufficientNft",
      "msg": "Insufficient NFT"
    },
    {
      "code": 6016,
      "name": "AlreadySendBack",
      "msg": "Already send back nft"
    },
    {
      "code": 6017,
      "name": "AlreadySetWinner",
      "msg": "Already setted winner"
    },
    {
      "code": 6018,
      "name": "GetPriceError",
      "msg": "Price isn't correct"
    },
    {
      "code": 6019,
      "name": "NotClaimedPrize",
      "msg": "Not claimed prize"
    }
  ]
}

export const IDL: Auction = {
  "version": "0.1.0",
  "name": "auction",
  "instructions": [
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionId",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "u32"
        },
        {
          "name": "endTime",
          "type": "u32"
        },
        {
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "bidIncrement",
          "type": "u64"
        },
        {
          "name": "minNftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "editAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "u32"
        },
        {
          "name": "endTime",
          "type": "u32"
        },
        {
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "bidIncrement",
          "type": "u64"
        },
        {
          "name": "minNftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "deleteAuction",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "nftCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "updateBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
         "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "nftCount",
          "type": "u32"
        }
      ]
   },
    {
      "name": "cancelBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendBackNft",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendBackFt",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ataTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setWinner",
      "accounts": [
        {
          "name": "partner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auctionId",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "startTime",
            "type": "u32"
          },
          {
            "name": "endTime",
            "type": "u32"
          },
          {
            "name": "minPrice",
            "type": "u64"
          },
          {
            "name": "bidIncrement",
            "type": "u64"
          },
          {
            "name": "bids",
            "type": {
              "array": [
                {
                  "defined": "Bid"
                },
                100
              ]
            }
          },
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "state",
            "type": "u32"
          },
          {
            "name": "minNftCount",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Bid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "u32"
          },
          {
            "name": "isWinner",
            "type": "u32"
          }
        ]
      }
   }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Bid price must be bigger than min price"
    },
    {
      "code": 6001,
      "name": "InvalidNft",
      "msg": "Invalid Nft"
    },
    {
      "code": 6002,
      "name": "OutOfAuction",
      "msg": "Auction had finished or not exist"
    },
    {
      "code": 6003,
      "name": "NotFinishAuction",
      "msg": "Auction isn't finished"
    },
    {
      "code": 6004,
      "name": "OverMaxCount",
      "msg": "Over max count"
    },
    {
      "code": 6005,
      "name": "CreateBidError",
      "msg": "Error in crate bid"
    },
    {
      "code": 6006,
      "name": "UpdateBidError",
      "msg": "Error in update bid"
    },
    {
      "code": 6007,
      "name": "CancelBidError",
      "msg": "Error in cancel bid"
    },
    {
      "code": 6008,
      "name": "ClaimBidError",
      "msg": "Error in claim bid"
    },
   {
      "code": 6009,
      "name": "AlreadyClaimed",
      "msg": "Already claimed"
    },
    {
      "code": 6010,
      "name": "AlreadyClaimedPrize",
      "msg": "Already claimed prize"
    },
    {
      "code": 6011,
      "name": "NotWinner",
      "msg": "Not winner"
    },
    {
      "code": 6012,
      "name": "ClaimPrizeError",
      "msg": "Error in claim prize"
    },
    {
      "code": 6013,
      "name": "SetWinnerError",
      "msg": "Error in set winner"
    },
    {
      "code": 6014,
      "name": "StartedAuction",
      "msg": "Auction already started"
    },
    {
      "code": 6015,
      "name": "InsufficientNft",
      "msg": "Insufficient NFT"
    },
    {
      "code": 6016,
      "name": "AlreadySendBack",
      "msg": "Already send back nft"
    },
    {
      "code": 6017,
      "name": "AlreadySetWinner",
      "msg": "Already setted winner"
    },
    {
      "code": 6018,
      "name": "GetPriceError",
      "msg": "Price isn't correct"
    },
    {
      "code": 6019,
      "name": "NotClaimedPrize",
      "msg": "Not claimed prize"
    }
  ]
}
