import { ChangeDetectionStrategy, Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full">
      <input 
        [type]="type()"
        [placeholder]="placeholder()"
        [maxLength]="maxlength()"
        [disabled]="disabled()"
        [value]="value()"
        [attr.list]="list()"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        class="w-full bg-glass border border-glass-border rounded-xl p-3 text-textPrimary outline-none placeholder:text-textMuted/60 transition-all font-medium min-w-0"
        [ngClass]="{
          'focus:border-primary focus:shadow-[0_0_15px_rgba(var(--color-primary),0.2)]': focusBorder() === 'primary',
          'focus:border-secondary focus:shadow-[0_0_15px_rgba(var(--color-secondary),0.2)]': focusBorder() === 'secondary',
          'opacity-50 pointer-events-none': disabled()
        }" />
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  type = input<string>('text');
  placeholder = input<string>('');
  maxlength = input<number>(100);
  focusBorder = input<'primary' | 'secondary'>('primary');
  disabled = input<boolean>(false);
  list = input<string | null>(null);

  value = signal<string>('');

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(val: any): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled dynamically via disabled signal input
  }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur() {
    this.onTouch();
  }
}
