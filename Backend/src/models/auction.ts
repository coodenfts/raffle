import { model, Schema, models, Model } from 'mongoose';

export interface Auction {
  id: number | null,
  project: string | null,
  image: string | null,
  tokenName: string | null,
  tokenId: string | null,
  mint: string | null,
  symbol: string | null,
  collectionName: string | null,
  description: string | null,
  discord: string | null,
  twitter: string | null,
  signedMessage: string | null,
  min_bid_amount: number | null,
  min_bid_increment: number | null,
  min_nft_count: number | null,
  floor_price: number | null,
  last_updated_fp: number | null,
  start_date: number | null,
  end_date: number | null,
  state: number | null,
  created_at: number | null,
}

const Auction: Schema<Auction> = new Schema<Auction>({
  id: { type: Number, required: true, unique: true },
  project: { type: String, required: true },
  image: { type: String },
  tokenName: { type: String },
  tokenId: { type: String },
  mint: { type: String, required: true },
  symbol: { type: String, required: true },
  collectionName: { type: String, required: false },
  description: { type: String, required: true },
  discord: { type: String, required: true },
  twitter: { type: String, required: true },
  signedMessage: { type: String },
  min_bid_amount: { type: Number, required: true },
  min_bid_increment: { type: Number, required: true },
  min_nft_count: { type: Number, required: true },
  floor_price: { type: Number, required: true },
  last_updated_fp: { type: Number, required: true },
  start_date: { type: Number, required: true },
  end_date: { type: Number, required: true },
  state: { type: Number, default: 0 },
  created_at: { type: Number, default: Date.now() / 1000 },
})


const AuctionModel: Model<Auction> = models['auction'] || model<Auction>('auction', Auction);
export default AuctionModel;
