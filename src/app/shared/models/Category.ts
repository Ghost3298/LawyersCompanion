export interface Category {
  _id?: string;
  name: string;
  content?: CategoryContent[];
}

export interface CategoryContent {
  title: string;
  details: string;
}