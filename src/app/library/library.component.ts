import { Component } from '@angular/core';
import { SplitScreenComponent } from "../shared/layouts/split-screen/split-screen.component";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Category, CategoryContent } from '../shared/models/Category';

@Component({
  selector: 'app-library',
  imports: [SplitScreenComponent, CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  public categories: Category[] =[];
  public selectedCategory: Category | null = null;  
  private sortByName : boolean = false;
  public filteredCategories: Category[] = [];
  public filteredContent: CategoryContent[] = [];
  public searchControl = new FormControl('');
  public contentSearchControl = new FormControl('');
  public addCat : boolean = false;
  public addCont : boolean = false;

  constructor(private http: HttpClient) {}

   ngOnInit(): void {
      this.http.get<Category[]>('http://localhost:3000/api/categories')
      .subscribe({
        next: (response) => {
          this.categories = response;
          this.filteredCategories = [...response];
        },
        error: (err) => {
          console.error('Error fetching categories:', err);
          this.categories = [{ name: 'No categories to show' }];
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

      this.contentSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterContent(searchTerm || '');
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

private filterContent(searchTerm: string): void {
    if (!this.selectedCategory?.content) {
      this.filteredContent = [];
      return;
    }
    
    if (!searchTerm) {
      this.filteredContent = [...this.selectedCategory.content];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredContent = this.selectedCategory.content.filter(item => 
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.details && item.details.toLowerCase().includes(term))
    );
  }

  setCategory(category: Category): void {
    this.selectedCategory = category;
    this.filteredContent = category.content ? [...category.content] : [];
    this.contentSearchControl.setValue(''); 
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

  toggleAddContent(){
    this.addCont = !this.addCont
  }

  editButton(){
    console.log('edit')
  }
}
