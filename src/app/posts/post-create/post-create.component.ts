import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostsService } from '../posts.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../post.model';
import { mimeTypeValidator } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  post: Post | null = null;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private authStatusSUb: Subscription;

  constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService,
  fb: FormBuilder) {
    this.form = fb.group({
      'title': ['', [Validators.required, Validators.minLength(3)]],
      'content': ['', [Validators.required]],
      'image': [null, [Validators.required], [mimeTypeValidator]]
    }); 
  }

  ngOnInit(): void {
    this.authStatusSUb = this.authService.authStatusEmitter.subscribe({
      next: status => {
        this.isLoading=false;
      }
    })

    this.route.paramMap.subscribe({
      next: paramMap => {
        if (paramMap.has('postId')) {
          this.isLoading = true;
          this.postsService.getPost(paramMap.get('postId')).subscribe({
            next: postData => {
              this.post = {
                id: postData._id,
                title: postData.title,
                content: postData.content,
                imagePath: postData.imagePath,
                creator: postData.creator
              };
              this.form.setValue({
                'title': this.post.title,
                'content': this.post.content,
                'image': this.post.imagePath
              });
              this.imagePreview = this.post.imagePath;
              this.isLoading = false;
            }
          });
        }
        else {
          this.post = null;
        }
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.post === null)
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    else
      this.postsService.updatePost(this.post.id, this.form.value.title, this.form.value.content, this.form.value.image);
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({'image': file});
    this.form.get('image').updateValueAndValidity();
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void {
      this.authStatusSUb.unsubscribe();
  }

  get title() {
    return this.form.get('title');  
  }

  get content() {
    return this.form.get('content');
  }

  get image() {
    return this.form.get('image');
  }
}
