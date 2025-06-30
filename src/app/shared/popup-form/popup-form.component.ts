import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-form',
  imports: [CommonModule],
  templateUrl: './popup-form.component.html',
  styleUrl: './popup-form.component.css'
})
export class PopupFormComponent implements AfterViewInit{
  ngAfterViewInit(): void {
    this.scrollToTarget()
  }
  @Input() isOpen: boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  togglePopup() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  scrollToTarget(){
    const targetElement = document.getElementById('popupDiv')
    if(targetElement) {
      targetElement.scrollIntoView({behavior: 'smooth', block:'end'})
    }
  }
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
