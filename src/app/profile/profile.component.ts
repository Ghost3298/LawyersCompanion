import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  public deleteAccountDiv: boolean = false;
  public editName : boolean = false;
  public editPass : boolean = false;
  public editMode = false;
  public passEditMode = false;

  toggleDeleteAccount(){
    this.deleteAccountDiv = !this.deleteAccountDiv;
  }

  toggleEditName(){
    this.editName = !this.editName;
    this.editMode = !this.editMode
  }

  toggleEditPass(){
    this.editPass = !this.editPass;
    this.passEditMode = !this.passEditMode;
  }
}
