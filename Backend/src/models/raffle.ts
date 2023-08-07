import { model, Schema, models, Model } from 'mongoose';

export interface Raffle {
  id: number | null,
  mint: string | null,
  symbol: string | null,
  collectionName: string | null,
  project: string | null,
  image: string | null,
  tokenName: string | null,
  tokenId: string | null,
  description: string | null,
  discord: string | null,
  twitter: string | null,
  signedMessage: string | null,
  price: number | null,
  total_tickets: number | null,
  min_nft_count: number | null,
  floor_price: number | null,
  last_updated_fp: number | null,
  start_date: number | null,
  created_at: number | null,
  end_date: number | null,
  state: number | null
}

const Raffle: Schema<Raffle> = new Schema<Raffle>({
  id: { type: Number, required: true, unique: true },
  mint: { type: String, required: true },
  symbol: { type: String, required: true },
  collectionName: { type: String, required: false },
  project: { type: String, required: true },
  image: { type: String },
  tokenName: { type: String },
  tokenId: { type: String },
  description: { type: String, required: true },
  discord: { type: String, required: true },
  twitter: { type: String, required: true },
  signedMessage: { type: String },
  price: { type: Number, required: true },
  total_tickets: { type: Number, required: false },
  min_nft_count: { type: Number, required: true },
  floor_price: { type: Number, required: true },
  last_updated_fp: { type: Number, required: true },
  start_date: { type: Number, required: true },
  created_at: { type: Number, default: Date.now() / 1000 },
  end_date: { type: Number, required: true },
  state: { type: Number, default: 0 },
})


const RaffleModel: Model<Raffle> = models['raffle'] || model<Raffle>('raffle', Raffle);
export default RaffleModel;
