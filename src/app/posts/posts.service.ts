import { Injectable } from '@angular/core';
import { Subject, exhaustMap, map } from 'rxjs';

import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
    .pipe(
      map(response => {
        return response.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          }
        })
      })
    )
    .subscribe({
      next: posts => {
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
      }
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = {id: null, title: title, content: content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post).subscribe({
      next: response => {
        console.log(response.message);
        post.id = response.postId;
        this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      }
    });
  }

  deletePost(postId: string) {
    this.http.delete<{message: string}>('http://localhost:3000/api/posts/' + postId).subscribe({
      next: response => {
        console.log(response.message);
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next(updatedPosts);
      }
    })
  }
}
