import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiUrl = req.url.startsWith('http://localhost:8080/api');

  if (isApiUrl) {
    const cloned = req.clone({
      withCredentials: true
    });
    return next(cloned);
  }

  return next(req);
};
