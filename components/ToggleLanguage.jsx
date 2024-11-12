"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18nConfig from "@/i18nConfig";
import { US, ID } from "country-flag-icons/react/3x2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ToggleLanguage = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentPathname = usePathname();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Set the language based on the path
    const pathLocale = currentPathname.split("/")[1];
    const currentLocale = i18nConfig.locales.includes(pathLocale) ? pathLocale : "en";
    setLanguage(currentLocale);
  }, [currentPathname]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);

    // Set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLanguage};expires=${date.toUTCString()};path=/`;

    // Redirect to the new locale path
    const newPath = currentPathname.replace(new RegExp(`^/(${i18nConfig.locales.join('|')})`), `/${newLanguage}`);
    router.push(newPath, newPath, { locale: newLanguage });

    // Refresh the router to ensure middleware is run
    router.refresh();
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case "en":
        return <US title="United States" className="w-6 h-4 inline-block mr-2" />;
      case "id":
        return <ID title="Indonesia" className="w-6 h-4 inline-block mr-2" />;
      default:
        return null;
    }
  };

  return (
      <div className="flex items-center space-x-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              <div className="flex items-center">
                {getLanguageIcon(language)}
                {language === "en" ? "English" : "Indonesian"}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">
              <div className="flex items-center">
                <US title="United States" className="w-6 h-4 inline-block mr-2" />
                English
              </div>
            </SelectItem>
            <SelectItem value="id">
              <div className="flex items-center">
                <ID title="Indonesia" className="w-6 h-4 inline-block mr-2" />
                Indonesian
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
  );
};

export default ToggleLanguage;
