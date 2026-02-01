import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      background: white;
      direction: ltr;
      text-align: left;
      
      h2 {
        color: #333 !important;
        padding: 24px 24px 16px !important;
        margin: 0 !important;
        font-size: 22px !important;
        font-weight: 700 !important;
        border-bottom: 1px solid #f0f0f0;
        text-align: left;
      }

      mat-dialog-content {
        padding: 24px !important;
        background: white;
        
        p {
          margin: 0;
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          text-align: left;
        }
      }

      mat-dialog-actions {
        padding: 16px 24px !important;
        margin: 0 !important;
        background: white;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-start;
        gap: 12px;

        button[mat-button] {
          color: #666;
          font-weight: 600;
          border-radius: 8px;
          padding: 0 24px;
          height: 42px;
          border: 1px solid #e0e0e0;

          &:hover {
            background-color: #f8f9fa;
            border-color: #d0d0d0;
          }
        }

        button[mat-raised-button] {
          background: linear-gradient(135deg, var(--accent-turquoise) 0%, var(--accent-cyan) 100%);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          padding: 0 32px;
          height: 42px;
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            transform: translateY(-1px);
          }
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
