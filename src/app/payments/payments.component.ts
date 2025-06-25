import { Component, HostListener, OnInit } from '@angular/core';
import { SplitScreenComponent } from '../shared/layouts/split-screen/split-screen.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-payments',
  imports: [ SplitScreenComponent, CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})

export class PaymentsComponent implements OnInit {
  folderId: string | null = null;
  payments: any[] = [];
  addPayment: boolean = false;
  searchQuery: string = '';
  filteredPayments: any[] = [];
  public searchControl = new FormControl('');
  public filterByDate : boolean = false;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // New payment form model
  newPayment = {
    type: '',
    amount: null,
    currency: '',
    note: '',
    date: new Date().toISOString().slice(0, 16)
  };
  searchTerm: string ='';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.folderId = this.route.snapshot.paramMap.get('folderId');
    
    if (this.folderId) {
      this.loadPayments(this.folderId);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterPayments(searchTerm || '')
      })
  }

  loadPayments(folderId: string): void {
    this.http.get<any[]>(`http://localhost:3000/api/folders/${folderId}/payments`)
      .subscribe({
        next: (response) => {
          this.payments = response;
          this.payments = response.map(p => ({
              ...p,
              displayDate: p.date ? new Date(p.date).toLocaleDateString('en-GB').replace(/\//g, '-') : 
                        (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A')
            }));
          this.filteredPayments = [...this.payments];     
        },
        error: (err) => {
          console.error('Error fetching payments:', err);
        }
      });

      
  }

  toggleAddPayment() {
    this.addPayment = !this.addPayment;
    if (!this.addPayment) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newPayment = {
      type: '',
      amount: null,
      currency: '',
      note: '',
      date: new Date().toISOString().slice(0, 16)
    };
  }

  onSubmit() {
    if (!this.folderId) return;

    // Validate required fields
    if (!this.newPayment.amount || !this.newPayment.currency || !this.newPayment.type) {
      console.error('Amount, currency, and type are required');
      return;
    }

    this.http.post(`http://localhost:3000/api/folders/${this.folderId}/payments`, this.newPayment)
      .subscribe({
        next: (response) => {
          console.log('Payment added successfully:', response);
          this.loadPayments(this.folderId!);
          this.toggleAddPayment();
        },
        error: (err) => {
          console.error('Error adding payment:', err);
          // Log the full error details
          console.error('Error details:', err.error);
        }
      });
  }

  // Update the filterPayments method:
filterPayments(searchTerm: string): void {
  if (!searchTerm) {
    this.filteredPayments = [...this.payments];
    return;
  }

  const term = searchTerm.toLowerCase();
  this.filteredPayments = this.payments.filter(p => {
    // Convert all searchable fields to strings and check for matches
    const noteMatch = p.note?.toLowerCase().includes(term) || false;
    const dateMatch = p.displayDate?.toLowerCase().includes(term) || false;
    const amountMatch = p.amount?.toString().includes(term) || false;
    const typeMatch = p.type?.toLowerCase().includes(term) || false;
    const currencyMatch = p.currency?.toLowerCase().includes(term) || false;

    return noteMatch || dateMatch || amountMatch || typeMatch || currencyMatch;
  });
}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.addPayment = false;
  }

  togglePaymentFilter(){
    this.filterByDate = !this.filterByDate;
    this.sortPayments();
  }

  sortPayments(){
    this.filteredPayments.sort((a, b) => {
    if (this.filterByDate) {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const amountA = a.amount || 0;
      const amountB = b.amount || 0;
      return this.sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
    }
  });
  }

  toggleSortDirection() {
  this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  this.sortPayments();
}
}