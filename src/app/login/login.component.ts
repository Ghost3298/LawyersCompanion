import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 public signup: boolean = false;
      public login: boolean = true;
      public isMobile :boolean=  false;
      public error: string = '';
      

      public loginForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', Validators.required)
      });


      public signUpForm: FormGroup = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [
          Validators.required, 
          Validators.email
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          this.createPasswordValidator() 
        ]),
        confirmPassword: new FormControl('', Validators.required)
        }, 
        { validators: this.passwordMatchValidator });

      private passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
      }

      private createPasswordValidator(): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
          if (!control.value) {
            return null;
          }
    
          const hasCapital = /[A-Z]/.test(control.value);
          const hasNumber = /[0-9]/.test(control.value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
    
          const passwordValid = hasCapital && hasNumber && hasSpecialChar;
    
          return !passwordValid ? { passwordRequirements: true } : null;
        };
      }

      showSignup(){
        this.signup = !this.signup;
        this.login = !this.login;
        this.error = '';
      }

      onLogin() {
        if (this.loginForm.valid) {
          console.log('Login form submitted', this.loginForm.value);
        } else {
          this.error = 'Please fill all required fields correctly';
        }
      }
    
      onSignUp() {
        if (this.signUpForm.valid) {
          console.log('Signup form submitted', this.signUpForm.value);
        } else {
          this.error = 'Please fill all required fields correctly and ensure passwords match';
        }
      }
}
