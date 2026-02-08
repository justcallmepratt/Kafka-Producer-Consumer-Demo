# Angular Migration Guide

## Overview

This guide helps you migrate from the current HTML/CSS/JavaScript frontend to a modern Angular application while keeping the Spring Boot backend.

## Architecture

```
Before:
┌─────────────────────────────┐
│   Spring Boot Application   │
│  ┌──────────┐  ┌──────────┐│
│  │  Backend │  │ Frontend ││
│  │   API    │  │   HTML   ││
│  └──────────┘  └──────────┘│
└─────────────────────────────┘

After:
┌──────────────────┐         ┌──────────────────┐
│  Spring Boot API │◄────────┤ Angular Frontend │
│    (Port 8080)   │  HTTP   │   (Port 4200)    │
└──────────────────┘         └──────────────────┘
```

## Step-by-Step Migration

### 1. Install Angular CLI

```bash
npm install -g @angular/cli@latest
```

### 2. Create New Angular Project

```bash
cd /Users/prathamsachan/Desktop
ng new kafka-demo-ui --routing=true --style=css
cd kafka-demo-ui
```

### 3. Project Structure

```
kafka-demo-ui/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── kafka-dashboard/
│   │   │       ├── kafka-dashboard.component.ts
│   │   │       ├── kafka-dashboard.component.html
│   │   │       └── kafka-dashboard.component.css
│   │   ├── services/
│   │   │   └── kafka.service.ts
│   │   ├── models/
│   │   │   └── message.model.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── assets/
└── angular.json
```

### 4. Install Dependencies

```bash
npm install rxjs@latest
```

### 5. Set Up Environments

**`src/environments/environment.ts`** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/kafka',
  apiBaseUrl: 'http://localhost:8080'
};
```

**`src/environments/environment.prod.ts`** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api/kafka',
  apiBaseUrl: 'https://your-production-api.com'
};
```

### 6. Create Message Model

**`src/app/models/message.model.ts`**:
```typescript
export interface Message {
  id: string;
  content: string;
  key: string | null;
  timestamp: string;
  topic: string;
}

export interface SendMessageRequest {
  message: string;
  key?: string;
}

export interface ApiResponse {
  status: string;
  message?: string;
  error?: string;
}
```

### 7. Copy Service & Component

Copy the example files from `angular-example/` folder:

```bash
# From the demo project root
cp angular-example/kafka-dashboard.component.ts ../kafka-demo-ui/src/app/components/kafka-dashboard/
cp angular-example/kafka-dashboard.component.html ../kafka-demo-ui/src/app/components/kafka-dashboard/
cp angular-example/kafka-dashboard.component.css ../kafka-demo-ui/src/app/components/kafka-dashboard/
```

Create the service manually (shown in main README).

### 8. Update App Module

**`src/app/app.module.ts`**:
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KafkaDashboardComponent } from './components/kafka-dashboard/kafka-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    KafkaDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 9. Configure Routing

**`src/app/app-routing.module.ts`**:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KafkaDashboardComponent } from './components/kafka-dashboard/kafka-dashboard.component';

const routes: Routes = [
  { path: '', component: KafkaDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 10. Update App Component

**`src/app/app.component.html`**:
```html
<router-outlet></router-outlet>
```

### 11. Run Both Applications

**Terminal 1 - Spring Boot Backend:**
```bash
cd /Users/prathamsachan/Desktop/demo
export $(cat .env.dev | grep -v '^#' | xargs)
./mvnw spring-boot:run
```

**Terminal 2 - Angular Frontend:**
```bash
cd /Users/prathamsachan/Desktop/kafka-demo-ui
ng serve
```

**Access:**
- Angular UI: http://localhost:4200
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health

## Advanced Features

### Add HTTP Interceptor for Error Handling

**`src/app/interceptors/http-error.interceptor.ts`**:
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        
        console.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

Register in `app.module.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
]
```

### Add Loading Indicator

**`src/app/services/loading.service.ts`**:
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.loadingSubject.next(false);
  }
}
```

### Add Material UI (Optional)

```bash
ng add @angular/material
```

## Production Build

### Build for Production

```bash
cd kafka-demo-ui
ng build --configuration production
```

### Deploy Angular Build with Spring Boot

1. Build Angular app
2. Copy `dist/` contents to `demo/src/main/resources/static/`
3. Build Spring Boot: `./mvnw clean package`
4. Deploy single JAR file

**Or use environment variables to serve separately (12-Factor recommended):**
- Backend: Deploy on Cloud Run, ECS, etc.
- Frontend: Deploy on Vercel, Netlify, S3+CloudFront

## Testing

### Unit Tests

```bash
ng test
```

### E2E Tests

```bash
ng e2e
```

### Test API Integration

```bash
# In Angular project
npm install --save-dev @angular/common/http/testing
```

## Benefits of Angular Migration

✅ **TypeScript**: Type safety and better IDE support
✅ **Components**: Reusable, modular architecture
✅ **Routing**: Single-page application with navigation
✅ **RxJS**: Powerful reactive programming
✅ **Testing**: Built-in unit and E2E testing
✅ **Performance**: Lazy loading, AOT compilation
✅ **Scalability**: Easy to add features and maintain
✅ **Ecosystem**: Rich library of components and tools

## Migration Checklist

- [ ] Install Angular CLI
- [ ] Create new Angular project
- [ ] Set up environment configurations
- [ ] Create models/interfaces
- [ ] Create Kafka service
- [ ] Create dashboard component
- [ ] Configure routing
- [ ] Update app module
- [ ] Test API integration
- [ ] Add error handling
- [ ] Add loading states
- [ ] Style components
- [ ] Test responsiveness
- [ ] Build for production
- [ ] Deploy

## Troubleshooting

**CORS Error:**
- Verify backend CORS configuration includes `http://localhost:4200`
- Check `CorsConfig.java` in Spring Boot

**API Not Found:**
- Ensure Spring Boot is running on port 8080
- Check `environment.ts` has correct API URL
- Verify network connectivity

**Module Not Found:**
- Run `npm install`
- Check imports in `app.module.ts`

**Build Errors:**
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Update Angular CLI: `npm install -g @angular/cli@latest`

## Next Steps

After migration:
1. Add authentication (JWT, OAuth2)
2. Implement state management (NgRx, Akita)
3. Add real-time updates (WebSocket)
4. Implement pagination
5. Add filtering and search
6. Create charts and visualizations
7. Add dark mode
8. Implement PWA features

---

Happy Angular Migration! 🚀
