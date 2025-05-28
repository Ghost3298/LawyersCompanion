import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SplitScreenComponent } from '../shared/layouts/split-screen/split-screen.component';
import { CommonModule } from '@angular/common';

interface User {
  _id: string;
  firstName: string;
  fathersName: string;
  lastName: string;
  email: string;
  phone: { number: string }[];
  importance: string;
  addresses: string[];
}

@Component({
  selector: 'app-dashboard',
  imports: [ SplitScreenComponent, ReactiveFormsModule, CommonModule, HttpClientModule, FormsModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})


export class DashboardComponent {
  public users: User[] = [];
  public filteredUsers: User[] = [];
  public searchControl = new FormControl('');
  public selectedCustomer: any = '';
  public sortByImportance : boolean = false;
  public addUser : boolean = false;
  public selectedCustomerNumber : any = '';
  public selectedPhoneIndex: number = 0;

  public newUser: any = {
    firstName: '',
    fathersName: '',
    lastName: '',
    email: '',
    phone: [],
    importance: 'low',
    addresses: [''],
  };
  public additionalAddresses: string[] = [];
  public additionalPhones: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>('http://localhost:3000/api/customers')
    .subscribe({
      next: (response: User[]) => {
        this.users = response;  // Direct assignment
        this.filteredUsers = [...response]; 
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.users = [
          {
            firstName: 'Test User', 
            fathersName: 'test', 
            lastName: 'test', 
            email: 'test@example.com', 
            phone: [], 
            addresses: [], 
            importance: 'low',
            _id: ''
          }
        ];
        this.filteredUsers = [...this.users];
      }
    });


    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged() 
      )
      .subscribe(searchTerm => {
        this.filterUsers(searchTerm || '');
      });
  }

  private filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.firstName.toLowerCase().includes(term) ||
      user.fathersName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      (user.firstName && user.firstName.toLowerCase().includes(term))
    );
  }

  setCustomer(user : any){
    this.selectedCustomer= user;
    this.selectedPhoneIndex = 0;
    if (user.phone?.[0]?.number) {
      this.selectedCustomerNumber = user.phone[0].number;
    }
  }

  togglePhoneNumber() {
  if (this.selectedCustomer?.phone?.length > 1) {
    this.selectedPhoneIndex = (this.selectedPhoneIndex + 1) % this.selectedCustomer.phone.length;
    this.selectedCustomerNumber = this.selectedCustomer.phone[this.selectedPhoneIndex].number;
  }
}

  onImportanceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked && this.selectedCustomer) {
      const newImportance = target.value;
      this.selectedCustomer.importance = newImportance;
      
      this.http.put(`http://localhost:3000/api/customers/${this.selectedCustomer._id}`, {
        importance: newImportance
      }).subscribe({
        next: (updatedCustomer: any) => {
          const index = this.users.findIndex(u => u._id === updatedCustomer._id);
          if (index !== -1) {
            this.users[index] = updatedCustomer;
            this.filteredUsers = [...this.users];
          }
        },
        error: (err) => {
          console.error('Error updating customer importance:', err);
          this.selectedCustomer.importance = this.selectedCustomer.importance === 'high' ? 'medium' : 
                                            this.selectedCustomer.importance === 'medium' ? 'low' : 'high';
        }
      });
    }
  }

  toggleSort() {
    this.sortByImportance = !this.sortByImportance;
    this.sortUsers();
  }

  private sortUsers() {
    if (this.sortByImportance) {
      this.filteredUsers.sort((a, b) => {
        if (a.importance === b.importance) return 0;
        if (a.importance === 'high') return -1;
        if (b.importance === 'high') return 1;
        if (a.importance === 'medium') return -1;
        if (b.importance === 'medium') return 1;
        return 0;});
    } else {
      this.filteredUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
    }
  }

  toggleAddUser(){
    this.addUser = !this.addUser
  }

  addAddressField() {
    this.additionalAddresses.push('');
  }

  removeAddress(index: number) {
    this.additionalAddresses.splice(index, 1);
  }

  addPhoneField() {
    this.additionalPhones.push('');
  }

  removePhone(index: number) {
    this.additionalPhones.splice(index, 1);
  } 

  addCustomer(){
    const phoneNumbers = this.additionalPhones.filter(phone=> phone.trim() !== '');
    if(this.newUser.phone){
      phoneNumbers.unshift(this.newUser.phone);
    }

    const addresses = this.additionalAddresses.filter(address=> address.trim() !== '');
    if(this.newUser.addresses[0]){
      addresses.unshift(this.newUser.addresses[0]);
    }

    const customerData ={
       firstName: this.newUser.firstName,
      fathersName: this.newUser.fathersName,
      lastName: this.newUser.lastName,
      email: this.newUser.email,
      phone: phoneNumbers.map(number => ({ number })),
      importance: this.newUser.importance,
      addresses: addresses
    };

    this.http.post('http://localhost:3000/api/customers', customerData)
      .subscribe({
        next: (response: any)=>{
          this.users.push(response);
          this.filteredUsers.push(response);

          this.resetForm();

          this.addUser = false;
        },
        error: (err)=>{
          console.log('Error adding customer:' , err);
        }
      });
  }

  resetForm(){
    this.newUser = {
    firstName: '',
    fathersName: '',
    lastName: '',
    email: '',
    phone: [],
    importance: 'low',
    addresses: [''],
  };
  this.additionalAddresses = [];
  this.additionalPhones = [];
  }
}