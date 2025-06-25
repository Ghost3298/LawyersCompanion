export interface Client {
  _id: string;
  firstName: string;
  fathersName: string;
  lastName: string;
  email: string;
  phone: { number: string }[];
  importance: string;
  addresses: string[];
}

export interface folder {
  _id?: string;
  title: string;
  number: string;
  location: string;
}