import { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Commitment, ConnectionConfig } from '@solana/web3.js';
import { useAnchorWallet, useConnection, } from '@solana/wallet-adapter-react';
import { datetimeLocal } from "../../../utils";

import CONFIG from "../../../config";
import { getAllAuctions } from "../../../services/api";
import Navbar from "../../../components/Navbar";
import Menus from "../../../components/Menus";
import searchIcon from "../../../assets/search-icon.png";
import AuctionUserItem from '../../../components/AuctionUserItem'
import FilterUserAuction from './FilterUserAuction'
import { VerifyCollection } from "../../../services/contracts/raffle";

const { Backend_URL, AUCTION, DECIMAL } = CONFIG;

const UserAuction = () => {
  const [isLoading, setLoading] = useState(false);
  const anchorWallet: any = useAnchorWallet();
  const { connection } = useConnection();

  const [auctionData, setAuctionData] = useState<any[]>([]);
  const [featuredData, setFeaturedData] = useState<any[]>([]);
  const [pastData, setPastData] = useState<any[]>([]);

  const [isFeatured, setFeatured] = useState(true);
  const [isAllAuction, setAllAuction] = useState(false);
  const [isPastAuction, setPastAuction] = useState(false);
  const [isFilterAuction, setFilterAuction] = useState(false);
  const [ownNfts, setOwnNfts] = useState([])
  const currentTime = Math.floor(Date.now() / 1000);
  const [menuIndex, setMenuIndex] = useState(0)

  const [filterData, setFilterData] = useState<any>({
    tokenId: ``,
    name: ``,
    endDate: new Date()
  })
  const [isFilterByItem, setFilterByItem] = useState([...auctionData])
  const [searchNft, setSearchNft] = useState(``)


  const handleFeaturedAuction = () => {
    setFeatured(true)
    setAllAuction(false);
    setPastAuction(false);
    setFilterAuction(false);
  }

  const handleAllAuction = () => {
    setFeatured(false)
    setAllAuction(true);
    setPastAuction(false);
    setFilterAuction(false);
  };
  const handlePastAuction = () => {
    setFeatured(false)
    setAllAuction(false);
    setPastAuction(true);
    setFilterAuction(false);
  };
  const handleFilterAuction = () => {
    // setFeatured(false)
    // setAllAuction(false);
    // setPastAuction(false);
    setFilterAuction(!isFilterAuction);
  };

  const handleKeyPress = (e: any) => {
    if(e.key === 'Enter') {
      handleFilterApplyBtn()
    }
  }

  const handleSearchNft = (input: any) => {
    setSearchNft(input)
    const filtered_name = !input ? auctionData
      : auctionData.filter(item => item.tokenName.toLowerCase().includes(input.toLowerCase()) || item.tokenId.toLowerCase().includes(input.toLowerCase()))
    setFilterByItem(filtered_name)
  }

  const handleRecentlyAdded = () => {
    const res = auctionData.sort((a: any, b: any) => b?.id - a?.id)
    setFilterByItem([...res])
    setMenuIndex(0)
  }

  const handleExpiringSoonSort = () => {
    // isFilterByItem
    const res = auctionData.sort((a: any, b: any) => a.end_date - b.end_date).filter((item: any) => currentTime > item.start_date && currentTime < item.end_date)
    setFilterByItem([...res])
    setMenuIndex(1)
  }

  
  const handleSellingOutSoonSort = () => {
    // isFilterByItem
    const res = auctionData.sort((a: any, b: any) => a.count - b.count).filter((item: any) => currentTime > item.start_date && currentTime < item.end_date)
    setFilterByItem([...res])
    setMenuIndex(2)
  }

  const handlePriceAscendingSort = () => {
    const res = auctionData.sort((a: any, b: any) => a.price - b.price)
    setFilterByItem([...res])
    setMenuIndex(3)
  }

  const handlePriceDescendingSort = () => {
    const res = auctionData.sort((a: any, b: any) => b.price - a.price)
    setFilterByItem([...res])
    setMenuIndex(4)
  }

  const handleFloorAscendingSort = () => {
    const res = auctionData.sort((a: any, b: any) => a.floor_price - b.floor_price)
    setFilterByItem([...res])
    setMenuIndex(5)
  }

  const handleFloorDescendingSort = () => {
    const res = auctionData.sort((a: any, b: any) => b.floor_price - a.floor_price)
    setFilterByItem([...res])
    setMenuIndex(6)
  }

  const handleFilterApplyBtn = () => {
    const filtered_endDate = !filterData.endDate ? auctionData
      : auctionData.filter(item => item.end_date < (new Date(filterData.endDate).getTime()) / 1000)

    const filtered_name = !filterData.name ? filtered_endDate
      : filtered_endDate.filter(item => item.tokenName.toLowerCase().includes(filterData.name.toLowerCase()))
    const filtered_tokenId = !filterData.tokenId
      ? filtered_name
      : filtered_name.filter((item) =>
        item.tokenId.includes(filterData.tokenId)
      );

    setFilterByItem(filtered_tokenId)

  }

  const handleFilterClearBtn = () => {
    setFilterByItem(auctionData)
    setFilterData({
      ...filterData,
      tokenId: ``,
      name: ``,
      endDate: new Date
    })
  }

  const getData = async () => {
    try {
      const getAuction: any = await getAllAuctions();

      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
      } as ConnectionConfig);

      const program = new anchor.Program(
        AUCTION.IDL,
        AUCTION.PROGRAM_ID,
        provider
      );

      let final_auction_All: any[] = []
      for (let i = 0; i < getAuction.length; i++) {
        const auctionId = new anchor.BN(getAuction[i].id);
      
        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(AUCTION.POOL_SEED),
            auctionId.toArrayLike(Buffer, "le", 8),
            new PublicKey(getAuction[i].mint).toBuffer(),
          ],
          program.programId
        );
        const exist_pool = await connection.getAccountInfo(pool);
        if (exist_pool) {
          console.log('pool', pool.toString())
          const poolData: any = await program.account.pool.fetch(pool);
         
          let bids = [] 
          bids = poolData?.bids

          let winner_buyerLists = [];
          for (let i = 0; i < bids.length; i++) {
            winner_buyerLists.push(bids[i].price.toNumber())
          }
          let high = 0;
          if(winner_buyerLists.length > 0)
            high = Math.max.apply(Math, winner_buyerLists);
          

          const result: any = bids.find((item: any) => item.isWinner === 1)
          console.log('result', bids)
          let winnerWalletAddress = ''
          if(result)
            winnerWalletAddress = result?.bidder?.toString()

          const res = {
            ...getAuction[i],
            count: poolData.count,
            winnerWalletAddress,
            endTime: poolData.endTime,
            topBidAmount: high / DECIMAL
          };
          final_auction_All.push(res)
        } else {
          final_auction_All.push(getAuction[i])
        }
      }

      setFilterByItem([...final_auction_All].sort((a: any, b: any) => b?.id - a?.id))
      setAuctionData([...final_auction_All].sort((a: any, b: any) => b?.id - a?.id));

      const featuredData = final_auction_All.filter(
        (item: any) => item.end_date >= Date.now() / 1000 && Date.now() / 1000 >= item.start_date
      );
      const pastData = final_auction_All.filter(
        (item: any) => item.end_date < Date.now() / 1000
      );

      setFeaturedData(featuredData.sort((a: any, b: any) => b?.id - a?.id));
      setPastData(pastData.sort((a: any, b: any) => b?.id - a?.id));

    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) return
          const _ownNfts: any = await VerifyCollection(anchorWallet?.publicKey.toBase58(), connection)
          setOwnNfts(_ownNfts)

        } catch (error) {

        }
      }
    )()

  }, [anchorWallet])


  return (
    <div className="bg-black">

      <Navbar />
      <Menus />
      <div className="max-w-[1280px] m-auto pt-8 px-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleFilterAuction}
            className={`${isFilterAuction
              ? "flex items-center py-3 px-5 bg-white text-black hover:text-white hover:bg-black border border-white rounded-[0.7rem]"
              : "flex items-center py-3 px-5 hover:bg-white hover:text-black text-white border border-white rounded-[0.7rem]"
              }`}
          >
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.7713 16.32L19.7013 15.5C19.7213 15.33 19.7413 15.17 19.7413 15C19.7413 14.83 19.7313 14.67 19.7013 14.5L20.7613 13.68C20.8513 13.6 20.8813 13.47 20.8213 13.36L19.8213 11.63C19.7613 11.5 19.6313 11.5 19.5013 11.5L18.2713 12C18.0013 11.82 17.7313 11.65 17.4213 11.53L17.2313 10.21C17.2213 10.09 17.1113 10 17.0013 10H15.0013C14.8713 10 14.7613 10.09 14.7413 10.21L14.5513 11.53C14.2513 11.66 13.9613 11.82 13.7013 12L12.4613 11.5C12.3513 11.5 12.2213 11.5 12.1513 11.63L11.1513 13.36C11.0913 13.47 11.1113 13.6 11.2113 13.68L12.2713 14.5C12.2513 14.67 12.2413 14.83 12.2413 15C12.2413 15.17 12.2513 15.33 12.2713 15.5L11.2113 16.32C11.1213 16.4 11.0913 16.53 11.1513 16.64L12.1513 18.37C12.2113 18.5 12.3413 18.5 12.4613 18.5L13.7013 18C13.9613 18.18 14.2413 18.35 14.5513 18.47L14.7413 19.79C14.7613 19.91 14.8613 20 15.0013 20H17.0013C17.1113 20 17.2213 19.91 17.2413 19.79L17.4313 18.47C17.7313 18.34 18.0013 18.18 18.2713 18L19.5013 18.5C19.6313 18.5 19.7613 18.5 19.8313 18.37L20.8313 16.64C20.8913 16.53 20.8613 16.4 20.7713 16.32ZM16.0013 16.5C15.1613 16.5 14.5013 15.83 14.5013 15C14.5013 14.17 15.1713 13.5 16.0013 13.5C16.8313 13.5 17.5013 14.17 17.5013 15C17.5013 15.83 16.8313 16.5 16.0013 16.5ZM1.00132 0C0.781322 0 0.571323 0.08 0.381323 0.22C-0.0486774 0.56 -0.128677 1.19 0.211323 1.62L5.97132 9H6.00132V14.87C5.96132 15.16 6.06132 15.47 6.29132 15.7L8.30132 17.71C8.65132 18.06 9.19132 18.08 9.58132 17.8C9.20132 16.91 9.00132 15.96 9.00132 15C9.00132 13.73 9.35132 12.5 10.0013 11.4V9H10.0313L15.7913 1.62C16.1313 1.19 16.0513 0.56 15.6213 0.22C15.4313 0.08 15.2213 0 15.0013 0H1.00132Z"
                fill="currentColor"
              />
            </svg>
            <span className="inline-block ml-2 text-base">Filter</span>
          </button>
          <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className=" text-[#fff] placeholder:text-[#9B9B9B] bg-[#46464680] text-base p-3 rounded-[0.6rem] border border-[#606060] outline-none text-[#9B9B9B]"
                value={searchNft}
                onChange={(e) => handleSearchNft(e.target.value)}
              />
              <img
                src={searchIcon}
                alt="searchIcon"
                className="absolute top-[12px] right-[10px] w-[26px]"
              />
            </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleFeaturedAuction}
              className={`${isFeatured
                ? "border border-white rounded-[0.7rem] bg-[#46464680]  text-[#9B9B9B] py-3 px-7"
                : "  bg-black  text-white py-3 px-7"
                }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={handleAllAuction}
              className={`${isAllAuction
                ? "border border-white rounded-[0.7rem] bg-[#46464680]  text-[#9B9B9B] py-3 px-7"
                : " bg-black  text-white py-3 px-7"
                }`}
            >
              All Auctions
            </button>
            <button
              type="button"
              onClick={handlePastAuction}
              className={`${isPastAuction
                ? "border border-white rounded-[0.7rem] bg-[#46464680]  text-[#9B9B9B] py-3 px-7"
                : " bg-black  text-white py-3 px-7"
                }`}
            >
              Past Auctions
            </button>
          </div>
        </div>
        {/* Filter Auction Tab  */}
        {isFilterAuction && (
          <>
            <h1 className="text-3xl mt-8 text-white">Filter auctions</h1>
            {isLoading ? (
              <div id="preloader"></div>
            ) :
              <div className="bg-black">
                <div className="max-w-[1280px] m-auto pt-8">

                  <div className="flex gap-[1rem]">
                    <div className="basis-[22%]">
                      <div className="border-4 border-[#606060] bg-white p-4 mt-6 rounded-[0.6rem]">
                        <h1 className="text-3xl">Sort</h1>
                        <ul className="ml-1">
                        <li className="my-2">
                            <p
                              onClick={handleRecentlyAdded}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 0 && "font-bold"}`}
                            >
                              Recently Added
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handleExpiringSoonSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 1 && "font-bold"}`}
                            >
                              Expiring Soon
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handleSellingOutSoonSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 2 && "font-bold"}`}
                            >
                              Selling Out Soon
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handlePriceAscendingSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 3 && "font-bold"}`}
                            >
                              Ticket Price (Ascending)
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handlePriceDescendingSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 4 && "font-bold"}`}
                            >
                              Ticket Price (Descending)
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handleFloorAscendingSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 5 && "font-bold"}`}
                            >
                              Floor (Ascending)
                            </p>
                          </li>
                          <li className="my-2">
                            <p
                              onClick={handleFloorDescendingSort}
                              className={`cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all ${menuIndex === 6 && "font-bold"}`}
                            >
                              Floor (Descending)
                            </p>
                          </li>
                        </ul>
                        <div className="mt-4">
                          <h1 className="text-3xl">Filter</h1>
                          <div className="my-2">
                            <label htmlFor="token">Token</label>
                            <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                              <input
                                type="text"
                                id="token"
                                name="token"
                                placeholder="Search by ID"
                                className="bg-[#46464680] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                value={filterData.tokenId}
                                onChange={(e) => setFilterData({ ...filterData, tokenId: e.target.value })}
                                onKeyPress={(e) => handleKeyPress(e)}
                              />
                            </div>
                          </div>
                          <div className="my-2">
                            <label htmlFor="collection">Collection</label>
                            <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                              <input
                                type="text"
                                id="collection"
                                name="collection"
                                placeholder="Search Collection"
                                className="bg-[#46464680] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                value={filterData.name}
                                onChange={(e) => setFilterData({ ...filterData, name: e.target.value })}
                                onKeyPress={(e) => handleKeyPress(e)}
                              />
                            </div>
                          </div>
                          <div className="my-2">
                            <label htmlFor="collection">Floor</label>
                            <div className="flex justify-between">
                              <div className="basis-[48%] relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                <input
                                  type="type"
                                  id="collection"
                                  name="collection"
                                  placeholder="Minimum"
                                  className="bg-[#46464680] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                  onKeyPress={(e) => handleKeyPress(e)}
                                />
                              </div>
                              <div className="basis-[48%] relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                <input
                                  type="type"
                                  id="collection"
                                  name="collection"
                                  placeholder="Maximum"
                                  className="bg-[#46464680] w-full text-[#606060] placeholder:text-[#606060] p-3 outline-none"
                                  onKeyPress={(e) => handleKeyPress(e)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="my-2">
                            <label htmlFor="collection">End Date</label>
                            <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                              <input
                                type="datetime-local"
                                id="collection"
                                name="collection"
                                placeholder="Search Collection"
                                className="bg-[#46464680] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                value={datetimeLocal(filterData.endDate)}
                                onChange={(e) => setFilterData({ ...filterData, endDate: new Date(e.target.value) })}
                                onKeyPress={(e) => handleKeyPress(e)}
                              />
                            </div>
                          </div>
                          <div className="mt-6 mb-2">
                            <div className="flex justify-between">
                              <button
                                type="button"
                                className="basis-[48%] rounded-[0.6rem] text-white bg-black py-3"
                                onClick={handleFilterApplyBtn}
                              >
                                Apply
                              </button>

                              <button
                                type="button"
                                className="basis-[48%] rounded-[0.6rem] text-white bg-[#606060] py-3"
                                onClick={handleFilterClearBtn}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="basis-[77%]" >

                      <div className="flex gap-[1rem] flex-wrap">
                        {
                          isFilterByItem.length > 0 ?
                            isFilterByItem.map((item: any, id: any) => (
                              <FilterUserAuction
                                isFilterAuction={isFilterAuction}
                                item={item}
                                id={id}
                                url={Backend_URL}
                                setLoading={setLoading}
                                ownNfts={ownNfts}
                              />
                            ))
                            :
                            <div className="text-white">There is no Auction Data</div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }


          </>
        )}
        {/* isFeatured Tab  */}
        {isFeatured && (
          <>
            <h1 className="text-3xl mt-8 text-white">Featured Auctions</h1>

            <div className="flex gap-[1rem] flex-wrap pb-12 md:max-w-[768px] lg:max-w-[100%] sm:max-w-[100%] md:m-auto">
              {isLoading ? (
                <div id="preloader"></div>
              ) : Array(featuredData) && featuredData.length > 0 ? (
                featuredData.map((item: any, id: any) => {
                  return <AuctionUserItem
                    key={id}
                    id={id}
                    item={item}
                    url={Backend_URL}
                    setLoading={setLoading}
                    ownNfts={ownNfts}
                  />;
                })
              ) : (
                <div className="text-white">There is no Auction Data</div>
              )}
            </div>
          </>
        )}
        {/* AllAuction Tab  */}
        {isAllAuction && (
          <>
            <h1 className="text-3xl mt-8 text-white">All Auction</h1>
            <div className="flex gap-[1rem] flex-wrap pb-12">
              {isLoading ? (
                <div id="preloader"></div>
              ) : Array(auctionData) && auctionData.length > 0 ? (
                auctionData.map((item: any, id: any) => {
                  return <AuctionUserItem
                    key={id}
                    id={id}
                    item={item}
                    url={Backend_URL}
                    setLoading={setLoading}
                    ownNfts={ownNfts}
                  />;
                })
              ) : (
                <div className="text-white">There is no Auction Data</div>
              )}
            </div>
          </>
        )}
        {/* Past Auction Tab  */}
        {isPastAuction && (
          <>
            <h1 className="text-3xl mt-8 text-white">Past Auction</h1>
            <div className="flex gap-[1rem] flex-wrap pb-12">
              {isLoading ? (
                <div id="preloader"></div>
              ) : Array(pastData) && pastData.length > 0 ? (
                pastData.map((item: any, id: any) => {
                  return <AuctionUserItem
                    key={id}
                    id={id}
                    item={item}
                    url={Backend_URL}
                    setLoading={setLoading}
                    ownNfts={ownNfts}
                  />;
                })
              ) : (
                <div className="text-white">There is no Auction Data</div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default UserAuction;
