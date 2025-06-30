export interface Category {
  _id?: string;
  name: string;
  content?: CategoryContent[];
}

export interface CategoryContent {
  _id?: string; // or mongoose.Types.ObjectId if you prefer
  title: string;
  details: string;
  createdAt?: Date;
}