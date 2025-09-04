// src/components/common/language-selector.tsx
"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/context/locale-context";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
  
  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as any)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="vi">Tiếng Việt</SelectItem>
      </SelectContent>
    </Select>
  )
}
