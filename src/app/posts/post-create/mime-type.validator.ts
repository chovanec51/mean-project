import { AbstractControl, AsyncValidatorFn } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeTypeValidator: AsyncValidatorFn = (control: AbstractControl): Observable<{[key: string]: any}> => {
    const file = control.value as File;
    const reader = new FileReader();
    
    if (typeof(control.value) === 'string') {
        return of(null);
    }

    return new Observable<{[key: string]: any}>((observer: Observer<{[key: string]: any}>) => {
        reader.addEventListener("loadend", () => {
            const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
            let header = "";
            for (let element of arr) {
                header += element.toString(16);
            }

            switch (header) {
                case '89504e47':
                    observer.next(null);
                    break;
                case "ffd8ffe0":
                case "ffd8ffe1":
                case "ffd8ffe2":
                case "ffd8ffe3":
                case "ffd8ffe8":
                    observer.next(null);
                    break;
                default:
                    observer.next({invalidMimeType: true});
                    break;
            }
            observer.complete();
        });
        reader.readAsArrayBuffer(file);
    });
}