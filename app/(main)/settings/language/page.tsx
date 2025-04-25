"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Check, Globe, Save } from "lucide-react";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function LanguageSettingsPage() {
  const { locale, changeLanguage } = useLanguage();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [hasChanges, setHasChanges] = useState(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if the selected locale is different from the current locale
  useEffect(() => {
    setHasChanges(selectedLocale !== locale);
  }, [selectedLocale, locale]);

  // Handle language change
  const handleSaveChanges = () => {
    changeLanguage(selectedLocale);
    toast({
      title: translations[selectedLocale as keyof typeof translations]?.changesSaved || "Changes saved",
      duration: 3000,
    });
    setHasChanges(false);
  };

  // Available languages with their details
  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flagEmoji: "🇺🇸",
    },
    {
      code: "th",
      name: "Thai",
      nativeName: "ไทย",
      flagEmoji: "🇹🇭",
    },
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      flagEmoji: "🇯🇵",
    },
    {
      code: "zh",
      name: "Chinese (Simplified)",
      nativeName: "简体中文",
      flagEmoji: "🇨🇳",
    },
  ];

  // Translations for localized text
  const translations = {
    en: {
      languageSettings: "Language Settings",
      chooseLanguage: "Choose your preferred language",
      currentLanguage: "Current language",
      saveChanges: "Save Changes",
      changesSaved: "Language changed successfully",
      description: "Choose the display language for the app"
    },
    th: {
      languageSettings: "ตั้งค่าภาษา",
      chooseLanguage: "เลือกภาษาที่คุณต้องการ",
      currentLanguage: "ภาษาปัจจุบัน",
      saveChanges: "บันทึกการเปลี่ยนแปลง",
      changesSaved: "เปลี่ยนภาษาสำเร็จแล้ว",
      description: "เลือกภาษาที่แสดงสำหรับแอป"
    },
    ja: {
      languageSettings: "言語設定",
      chooseLanguage: "ご希望の言語を選択してください",
      currentLanguage: "現在の言語",
      saveChanges: "変更を保存",
      changesSaved: "言語が正常に変更されました",
      description: "アプリの表示言語を選択"
    },
    zh: {
      languageSettings: "语言设置",
      chooseLanguage: "选择您的首选语言",
      currentLanguage: "当前语言",
      saveChanges: "保存更改",
      changesSaved: "语言更改成功",
      description: "选择应用程序的显示语言"
    }
  };

  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <motion.div
      className="max-w-md mx-auto min-h-screen pb-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold">{t.languageSettings}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
        </div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              {t.chooseLanguage}
            </CardTitle>
            <CardDescription>
              {t.currentLanguage}: {languages.find(lang => lang.code === locale)?.nativeName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLocale}
              onValueChange={(value) => setSelectedLocale(value as "en" | "th" | "ja" | "zh")}
              className="space-y-3"
            >
              {languages.map((language) => (
                <div key={language.code} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={language.code}
                    id={`language-${language.code}`}
                  />
                  <Label
                    htmlFor={`language-${language.code}`}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span className="text-lg">{language.flagEmoji}</span>
                    <span>{language.nativeName}</span>
                    <span className="text-[hsl(var(--muted-foreground))] text-sm">
                      {language.code !== language.name.toLowerCase() && `(${language.name})`}
                    </span>
                    {locale === language.code && (
                      <Check className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className="w-full mt-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {t.saveChanges}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 