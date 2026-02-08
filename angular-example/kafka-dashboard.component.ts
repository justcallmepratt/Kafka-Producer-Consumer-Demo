import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KafkaService, Message } from '../../services/kafka.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Angular Component Example for Kafka Demo
 * 
 * To use this component:
 * 1. Create Angular project: ng new kafka-demo-ui
 * 2. Generate component: ng generate component components/kafka-dashboard
 * 3. Replace component code with this file
 * 4. Import ReactiveFormsModule and HttpClientModule in app.module.ts
 */

@Component({
  selector: 'app-kafka-dashboard',
  templateUrl: './kafka-dashboard.component.html',
  styleUrls: ['./kafka-dashboard.component.css']
})
export class KafkaDashboardComponent implements OnInit, OnDestroy {
  messageForm: FormGroup;
  messages: Message[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private kafkaService: KafkaService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
      key: ['']
    });
  }

  ngOnInit(): void {
    this.loadMessages();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Send message to Kafka
   */
  sendMessage(): void {
    if (this.messageForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    
    const { message, key } = this.messageForm.value;

    this.kafkaService.sendMessage(message, key).subscribe({
      next: (response) => {
        this.success = 'Message sent successfully!';
        this.messageForm.reset();
        setTimeout(() => this.success = null, 3000);
        
        // Refresh messages after a short delay
        setTimeout(() => this.loadMessages(), 500);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to send message';
        this.loading = false;
      }
    });
  }

  /**
   * Load messages from backend
   */
  loadMessages(): void {
    this.kafkaService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
      }
    });
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    if (!confirm('Are you sure you want to clear all messages?')) {
      return;
    }

    this.kafkaService.clearMessages().subscribe({
      next: () => {
        this.success = 'Messages cleared successfully!';
        this.messages = [];
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to clear messages';
      }
    });
  }

  /**
   * Start auto-refresh every 2 seconds
   */
  private startAutoRefresh(): void {
    this.refreshSubscription = interval(2000)
      .pipe(switchMap(() => this.kafkaService.getMessages()))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
        },
        error: (err) => {
          console.error('Auto-refresh failed:', err);
        }
      });
  }

  /**
   * Stop auto-refresh
   */
  private stopAutoRefresh(): void {
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
}
