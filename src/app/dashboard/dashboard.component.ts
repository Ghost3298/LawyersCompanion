import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SplitScreenComponent } from '../shared/layouts/split-screen/split-screen.component';
import { CommonModule } from '@angular/common';
import { Client } from '../shared/models/customer';
import { Folder } from '../shared/models/Folder';
import { Router } from '@angular/router';
import { PopupFormComponent } from "../shared/popup-form/popup-form.component";


@Component({
  selector: 'app-dashboard',
  imports: [SplitScreenComponent, ReactiveFormsModule, CommonModule, HttpClientModule, FormsModule, PopupFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})


export class DashboardComponent {
  public users: Client[] = [];
  public filteredUsers: Client[] = [];
  public searchControl = new FormControl('');
  public selectedCustomer: any = '';
  public sortByImportance : boolean = false;
  public sortByStatus: boolean = false;
  public addUser : boolean = false;
  public selectedCustomerNumber : any = '';
  public selectedPhoneIndex: number = 0;
  public editCustomer: boolean = false;
  public editMode : boolean = false;
  public folders : Folder[] =[];
  public addFolder: boolean = false;

  public newUser: any = {
    firstName: '',
    fathersName: '',
    lastName: '',
    email: '',
    phone: [''],
    importance: 'low',
    addresses: [''],
  };
  public additionalAddresses: string[] = [];
  public additionalPhones: string[] = [];

  constructor(
    private http: HttpClient,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.http.get<Client[]>('http://localhost:3000/api/customers')
    .subscribe({
      next: (response: Client[]) => {
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

    this.folders = []; 
  
  this.http.get<Folder[]>(`http://localhost:3000/api/clients/${user._id}/folders`)
    .subscribe({
      next: (response) => {
        this.folders = response;
      },
      error: (err) => {
        console.error('Error fetching folders:', err);
      }
    });
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

  toggleSortFolders(){
    this.sortByStatus = !this.sortByStatus;
    this.sortFolders()
  }

  private sortFolders(){
    if(this.sortByStatus){
      this.folders.sort((a,b)=>{
        if(a.status === b.status) return 0;
        if(a.status === 'opened') return -1;
        if(b.status === 'opened') return 1;
        if(a.status === 'closed') return -1;
        if(b.status === 'closed') return -1;
      return 0;})
    } else {
      this.folders.sort((a,b)=> a.opponents.localeCompare(b.opponents));
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

  trackByIndex(index: number, item: any): number {
    return index;
  }

  @HostListener('document:keydown.escape', ['$event'])
    handleEscapeKey(event: KeyboardEvent){
      this.addUser = false;
      this.editCustomer = false;
      this.addFolder = false;
    }


    toggleEditMode(){
      this.editMode= !this.editMode
    }

    submitEdit() {
      if (!this.selectedCustomer) return;

      const updatedAddresses = [...this.selectedCustomer.addresses, ...this.additionalAddresses.filter(addr => addr.trim() !== '')];
      
      const updatedPhones = [
        ...this.selectedCustomer.phone,
        ...this.additionalPhones.filter(phone => phone.trim() !== '').map(number => ({ number }))
      ];

      const updatedCustomer = {
        ...this.selectedCustomer,
        addresses: updatedAddresses,
        phone: updatedPhones
      };

      this.http.put(`http://localhost:3000/api/customers/${this.selectedCustomer._id}`, updatedCustomer)
        .subscribe({
          next: (response: any) => {
            // Update the local data
            const index = this.users.findIndex(u => u._id === response._id);
            if (index !== -1) {
              this.users[index] = response;
              this.filteredUsers = [...this.users];
              this.selectedCustomer = response;
            }
            
            // Reset edit mode
            this.editMode = false;
            this.editCustomer = false;
            this.additionalAddresses = [];
            this.additionalPhones = [];
          },
          error: (err) => {
            console.error('Error updating customer:', err);
          }
        });
    }

    toggleEditCustomer() {
      this.editCustomer = !this.editCustomer;
      this.editMode = false;
      this.additionalAddresses = [];
      this.additionalPhones = [];
    }

    toggleAddFolder(){
      this.addFolder = !this.addFolder;
    }

    // Add this method to your DashboardComponent class
    addNewFolder(formData: any) {
      if (!this.selectedCustomer) return;

      const folderData = {
        clientId: this.selectedCustomer._id,
        opponents: formData.opponents,
        number: formData.number,
        location: formData.location,
        type: formData.type || '',
        notes: formData.notes || ''
      };

      this.http.post<Folder>('http://localhost:3000/api/folders', folderData)
        .subscribe({
          next: (response) => {
            this.folders.unshift(response);
            this.addFolder = false;
          },
          error: (err) => {
            console.error('Error adding folder:', err);
          }
        });
    }

  goToPayments(folderId: string) {
    this.router.navigate(['/home/payments', folderId]);
  }
}