export interface Folder {
    _id?: string;
    clientId: string;  
    opponents: string;
    number: string;
    location: string;
    type: string;
    notes: string;
    createdAt?: Date; 
    updatedAt?: Date;
    status : string;
}