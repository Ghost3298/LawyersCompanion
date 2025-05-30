export interface Customer {
  _id: string;
  firstName: string;
  fathersName: string;
  lastName: string;
  email: string;
  phone: { number: string }[];
  importance: string;
  addresses: string[];
}