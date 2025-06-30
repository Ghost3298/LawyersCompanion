import { Component, HostListener } from '@angular/core';
import { SplitScreenComponent } from "../shared/layouts/split-screen/split-screen.component";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Category, CategoryContent } from '../shared/models/Category';
import { NgForm } from '@angular/forms';
import { PopupFormComponent } from "../shared/popup-form/popup-form.component";

@Component({
  selector: 'app-library',
  imports: [SplitScreenComponent, CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule, PopupFormComponent],
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
  public editingContent: CategoryContent | null = null;
  public editContentForm = new FormGroup({
    title: new FormControl(''),
    details: new FormControl('')
  });

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

  toggleAddCat() {
    this.addCat = !this.addCat;
  }

  toggleAddContent(){
    this.addCont = !this.addCont
  }

  startEdit(content: CategoryContent): void {
    this.editingContent = content;
    this.editContentForm.setValue({
      title: content.title,
      details: content.details
    });
  }

  cancelEdit(): void {
  this.editingContent = null;
}

updateContent(): void {
  if (!this.editingContent || !this.selectedCategory) return;

  const updatedContent = {
    title: this.editContentForm.value.title || '',
    details: this.editContentForm.value.details || ''
  };

  this.http.put<CategoryContent>(
    `http://localhost:3000/api/categories/${this.selectedCategory._id}/content/${this.editingContent._id}`,
    updatedContent
  ).subscribe({
    next: (response) => {
      if (!this.selectedCategory?.content) return;
      
      const index = this.selectedCategory.content.findIndex(
        item => item._id === this.editingContent?._id
      );
      
      if (index !== -1) {
        this.selectedCategory.content[index] = response;
        this.filteredContent = [...this.selectedCategory.content];
      }
      
      this.editingContent = null;
    },
    error: (err) => {
      console.error('Error updating content:', err);
    }
  });
}

  @HostListener('document:keydown.escape', ['$event'])
handleEscapeKey(event: KeyboardEvent) {
  this.addCat = false;
  this.addCont = false;
  this.cancelEdit();
}

  addCategory(form: NgForm):void{
    if(form.invalid) return;

    const newCategory = {
      name : form.value.name,
      content: []
    };

    this.http.post<Category>('http://localhost:3000/api/categories', newCategory)
      .subscribe({
        next: (response) =>{
          this.categories.push(response);
          this.filteredCategories = [...this.categories];
          this.toggleAddCat();
          form.reset();
        },
        error: (err) =>{
          console.error('Error adding category:', err);
        }
      });
  }

  addContent(form: NgForm):void{
  if (form.invalid || !this.selectedCategory) return;

  const newContent = {
    title: form.value.title,
    details: form.value.details
  };

  this.http.post<CategoryContent>(`http://localhost:3000/api/categories/${this.selectedCategory._id}/content`, newContent)
    .subscribe({
      next: (response) => {
        if (!this.selectedCategory) return;
        
        if (!this.selectedCategory.content) {
          this.selectedCategory.content = [];
        }
        
        this.selectedCategory.content.push(response);
        this.filteredContent = [...this.selectedCategory.content];
        this.toggleAddContent();
        form.reset();
      },
      error: (err) => {
        console.error('Error adding content:', err);
      }
    });
}
}
