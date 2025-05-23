import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [ MatIconModule, CommonModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
public username = 'Guest';
  public menuOpen = false;
  public isMobile = false;

  constructor(
    private router : Router,
  ){}


  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 667;
    if (!this.isMobile) {
      this.menuOpen = true;
    } else {
      this.menuOpen = false
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(location : String){
    this.router.navigate([`/home/${location}`]);
    if(this.isMobile){
      this.toggleMenu();
    }
  }
}