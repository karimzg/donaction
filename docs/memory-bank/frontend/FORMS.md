# Frontend Forms Reference

## Validation Functions

Located in `validations.ts`:

| Function | Purpose |
|----------|---------|
| `validateEmail(value)` | Email format (regex) |
| `validateRequired(value)` | Non-empty check |
| `validateString(value)` | String format |
| `validatePassword(value)` | Password strength |
| `validateSame(val1, val2)` | Field match |
| `validateTrue(value)` | Boolean true |
| `validateSiren(value)` | SIREN format (9 digits) |
| `validateAmount(value)` | Numeric amount |
| `validateDate(value)` | Date format |
| `validateDateMajor(value)` | Age 18+ check |
| `validateSelection(value)` | Selection made |

## Regex Patterns

```typescript
emailRexExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
sirenRexExp = /^\d{9}$/
stringRexExp = /^[a-zA-ZÀ-ÿ\s'-]+$/
stringWithoutNumbersRexExp = /^[^\d]+$/
```

## Feedback Pattern

### Structure
```typescript
interface Feedback {
  attribute: string;      // Field name
  cast: Constructor;      // String, Number, Boolean
  isValid: boolean;
}
```

### Collection Flow
```typescript
// In custom hook (e.g., useSponsorshipForm)
const receivedFeedbacks = useRef<Feedback[]>([]);

const DEFAULT_FEEDBACK = (feedback: Feedback) => {
  receivedFeedbacks.current.push(feedback);
  // Update defaultValues in config
  // Check email existence if needed
};
```

### Validation Trigger
```typescript
// Increment counter to trigger all fields
const [triggerValidation, setTriggerValidation] = useState(0);

// On submit
receivedFeedbacks.current = []; // Clear
setTriggerValidation(prev => prev + 1); // Trigger

// Wait for async validation
process.nextTick(() => {
  const allValid = receivedFeedbacks.current.every(f => f.isValid);
  if (allValid) submitForm();
});
```

## Error Display

```tsx
<input
  className={error ? 'invalid' : 'valid'}
  onBlur={handleValidation}
/>
{error && <small className="error">{error}</small>}
```

## reCAPTCHA Integration

```typescript
const token = await grecaptcha.enterprise.execute(
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  { action: 'submit_donation' }
);

// Include in API call
await postDon({ ...formData, recaptchaToken: token });
```
