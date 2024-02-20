import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "./auth-data.model";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _token: string;
    private _authStatusEmitter = new BehaviorSubject<boolean>(false);
    private _userId: string;
    private _tokenTimer: any;
    
    constructor(private http: HttpClient, private router: Router) {

    }
    
    get token() {
        return this._token;
    }

    get authStatusEmitter() {
        return this._authStatusEmitter;
    }

    get userId() {
        return this._userId;
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {
            'email': email,
            'password': password
        };

        this.http.post<{message: string, result: any}>('http://localhost:3000/api/users/signup', authData).subscribe({
            next: response => {
                this.router.navigate(['/login']);
                alert(response.message);
            },
            error: err => {
                this._authStatusEmitter.next(false);
            }
        })
    }

    login(email: string, password: string) {
        const authData: AuthData = {
            'email': email,
            'password': password
        };
        
        this.http.post<{message: string, token: string, expiresIn: number, userId: string}>('http://localhost:3000/api/users/login', authData).subscribe({
            next: response => {
                console.log(response.message);
                this._token = response.token;
                if (this._token) {
                    this.autoLogout(response.expiresIn);
                    this._authStatusEmitter.next(true);
                    this._userId = response.userId;
                    this.router.navigate(['/']);

                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + response.expiresIn*1000);
                    this.saveAuthData(this._token, expirationDate, this._userId);
                }
            },
            error: err => {
                this._authStatusEmitter.next(false);
            }
        });
    }

    autoLogin() {
        const authData = this.getAuthData();
        if (!authData) {
            return;
        }
        const now = new Date();
        const expiresIn = authData.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this._token = authData.token;
            this._userId = authData.userId;
            this._authStatusEmitter.next(true);
            this.autoLogout(expiresIn/1000);
        }
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        if (!token || !expDate) {
            return null;
        }
        return {
            token: token,
            expirationDate: new Date(expDate),
            userId: userId
        }
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    logout() {
        this.router.navigate(['/']);
        this._token = null;
        this._userId = null;
        this._authStatusEmitter.next(false);
        clearTimeout(this._tokenTimer);
        this.clearAuthData();
    }

    private autoLogout(duration: number) {
        this._tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000)
    }
}