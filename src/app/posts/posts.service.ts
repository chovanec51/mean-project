import { Injectable } from '@angular/core';
import { Subject, map } from 'rxjs';

import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, totalCount: number}>(BACKEND_URL+queryParams)
    .pipe(
      map(response => {
        return { 
          posts: response.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator };
          }),
          totalCount: response.totalCount
        };
      })
    )
    .subscribe({
      next: postData => {
        this.posts = postData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: postData.totalCount });
      }
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string, 
      title: string, 
      content: string, 
      imagePath: string, 
      creator: string
    }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData).subscribe({
      next: response => {
        this.router.navigate(['/']);
      }
    });
  }

  updatePost(id: string, title: string, content: string, image: string | File) {
    let postData: FormData | Post;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    }
    else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    
    this.http.put<{message: string, imagePath: string}>(BACKEND_URL + id, postData).subscribe({
      next: response => {
        this.router.navigate(['/']);
      }
    });
  }

  deletePost(postId: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + postId)
  }
}
