import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuestionInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  minLength?: number;
  maxLength?: number;
}

export function QuestionInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  minLength = 0,
  maxLength = 500,
}: QuestionInputProps) {
  const charCount = value.length;
  const isValid = charCount >= minLength && charCount <= maxLength;
  const showMinLengthHint = minLength > 0 && charCount < minLength;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[160px] resize-none"
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {showMinLengthHint && `至少 ${minLength} 字`}
        </span>
        <span className={charCount > maxLength * 0.9 ? 'text-warning' : ''}>
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}
