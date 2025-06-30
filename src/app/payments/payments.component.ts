import { Component, HostListener, OnInit } from '@angular/core';
import { SplitScreenComponent } from '../shared/layouts/split-screen/split-screen.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { PopupFormComponent } from "../shared/popup-form/popup-form.component";

@Component({
  selector: 'app-payments',
  imports: [SplitScreenComponent, CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, MatIconModule, PopupFormComponent],
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
  public deletePayment : boolean = false
  public selectedPayment : any = '';
  public folderDetails: any = null;
  public editFolderMode: boolean = false;
  public updatedFolderData: any = {};

  public feeTotals = {
    USD: 0,
    LBP: 0
  };
  public expenseTotals = {
    USD: 0,
    LBP: 0
  };

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
      this.loadFolderDetails(this.folderId);
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
        
        // Calculate totals
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
      }
    });
  }

    calculateTotals(): void {
      // Reset totals
      this.feeTotals = { USD: 0, LBP: 0 };
      this.expenseTotals = { USD: 0, LBP: 0 };

      this.payments.forEach(payment => {
        if (payment.type === 'fees') {
          if (payment.currency === 'USD') {
            this.feeTotals.USD += payment.amount;
          } else if (payment.currency === 'LBP') {
            this.feeTotals.LBP += payment.amount;
          }
        } else if (payment.type === 'expenses') {
          if (payment.currency === 'USD') {
            this.expenseTotals.USD += payment.amount;
          } else if (payment.currency === 'LBP') {
            this.expenseTotals.LBP += payment.amount;
          }
        }
      });
    }

  loadFolderDetails(folderId: string): void {
    this.http.get<any>(`http://localhost:3000/api/folders/${folderId}`)
      .subscribe({
        next: (folder) => {
          this.folderDetails = folder;
          // Initialize the updated data with current folder details
          this.updatedFolderData = { ...folder };
        },
        error: (err) => {
          console.error('Error fetching folder details:', err);
        }
      });
  }

  toggleEditFolderMode(): void {
    this.editFolderMode = !this.editFolderMode;
    if (!this.editFolderMode) {
      // Reset updated data when cancelling edit
      this.updatedFolderData = { ...this.folderDetails };
    }
  }

  // Add this method to save folder updates
  updateFolder(): void {
  if (!this.folderId || !this.folderDetails?._id) return;

  this.http.put(`http://localhost:3000/api/folders/${this.folderDetails._id}`, this.updatedFolderData)
    .subscribe({
      next: (updatedFolder) => {
        this.folderDetails = updatedFolder;
        this.editFolderMode = false;
        // Optional: Show success message
        console.log('Folder updated successfully');
      },
      error: (err) => {
        console.error('Error updating folder:', err);
        // Optional: Show error message to user
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
    this.deletePayment = false
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


  deleteSelectedPayment() {
    if (!this.folderId || !this.selectedPayment?._id) return;

    this.http.delete(`http://localhost:3000/api/folders/${this.folderId}/payments/${this.selectedPayment._id}`)
      .subscribe({
        next: () => {
          console.log('Payment deleted successfully');
          this.loadPayments(this.folderId!);
          this.toggleDeletePayment();
        },
        error: (err) => {
          console.error('Error deleting payment:', err);
        }
      });
  }
  
  toggleDeletePayment(payment?: any) {
    this.selectedPayment = payment || '';
    this.deletePayment = !this.deletePayment;
  }
}