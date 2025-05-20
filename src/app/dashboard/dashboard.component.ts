import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SplitScreenComponent } from '../shared/layouts/split-screen/split-screen.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ SplitScreenComponent, ReactiveFormsModule, CommonModule, HttpClientModule, FormsModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  public users: any[] = [];
  public filteredUsers: any[] = [];
  public searchControl = new FormControl('');
  public selectedCustomer: any = '';
  public sortByImportance : boolean = false;
  public addUser : boolean = false;


  public newUser: any = {
    firstName: '',
    fathersName: '',
    lastName: '',
    email: '',
    phone: '',
    importance: 'low',
    addresses: [''],
  };
  public additionalAddresses: string[] = [];
  public additionalPhones: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('assets/test-users.json')
      .subscribe({
        next: (response: any) => {
          this.users = response.users;
          this.filteredUsers = [...this.users]; 
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          this.users = [
            { name: 'Test User', email: 'test@example.com' , phone: '+96178895888', importance: 'low'}
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
      (user.username && user.username.toLowerCase().includes(term))
    );
  }

  setCustomer(user : any){
    this.selectedCustomer= user;
  }

  onImportanceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedCustomer.importance = target.value;
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
}