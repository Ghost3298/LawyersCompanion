import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
time : number = 5;
  private timer: any;

  constructor(
    private router: Router
  ){}

  ngOnInit(): void {
    const timer = setInterval(() => {
      this.time--;
      
      if (this.time <= 0) {
        clearInterval(timer);
        this.router.navigate(['home']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}