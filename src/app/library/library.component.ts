import { Component } from '@angular/core';
import { SplitScreenComponent } from "../shared/layouts/split-screen/split-screen.component";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-library',
  imports: [SplitScreenComponent, CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  public categories: any[] =[];
  public selectedCategory: any = '';  
  private sortByName : boolean = false;
  public filteredCategories: any[] = [];
  public searchControl = new FormControl('');
  public addCat : boolean = false;

  constructor(private http: HttpClient) {}

   ngOnInit(): void {
      this.http.get('assets/test-categories.json')
        .subscribe({
          next: (response: any) => {
            this.categories = response.categories;
            this.filteredCategories = [...this.categories]; 
          },
          error: (err) => {
            console.error('Error fetching users:', err);
            this.categories = [
              { name: 'Test User', email: 'test@example.com' , phone: '+96178895888', importance: 'low'}
            ];
            this.filteredCategories = [...this.categories];
          }
        });
  
  
      this.searchControl.valueChanges
        .pipe(
          debounceTime(300), 
          distinctUntilChanged() 
        )
        .subscribe(searchTerm => {
          this.filterCategories(searchTerm || '');
        });
    }

   private filterCategories(searchTerm: string): void {
  if (!searchTerm) {
    this.filteredCategories = [...this.categories];
    return;
  }

  const term = searchTerm.toLowerCase();
  this.filteredCategories = this.categories.filter(category => 
    category.name && category.name.toLowerCase().includes(term)
  );
}

  setCategory(category : any){
    this.selectedCategory= category;
  }

  toggleSort() {
    this.sortByName = !this.sortByName;
    this.sortUsers();
  }

  private sortUsers() {
    if (this.sortByName) {
      this.filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  toggleAddCat(){
    this.addCat = !this.addCat
  }
}
