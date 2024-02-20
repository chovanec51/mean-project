import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.authStatusEmitter.subscribe({
      next: authStatus => {
        this.isLoading = false;
      }
    });
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe();
  }
}
