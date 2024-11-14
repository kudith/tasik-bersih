"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import i18nConfig from "@/i18nConfig";
import { US, ID } from "country-flag-icons/react/3x2"; // Import flags for US and Indonesia

export default function ToggleLanguage() {
  const router = useRouter();
  const currentPathname = usePathname();
  const defaultLocale = i18nConfig.defaultLocale;
  const [currentLocale, setCurrentLocale] = useState(defaultLocale);

  // Set current locale based on URL path on initial load
  useEffect(() => {
    const pathLocale = currentPathname.startsWith("/id") ? "id" : "en";
    setCurrentLocale(pathLocale);
  }, [currentPathname]);

  const handleChange = (newLocale) => {
    // Set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;

    // Update URL path based on the selected locale
    const newPath =
        newLocale === defaultLocale && !i18nConfig.prefixDefault
            ? currentPathname.replace(/^\/(id)/, "") || "/" // remove locale prefix for default
            : `/${newLocale}${currentPathname.replace(/^\/(id|en)/, "")}`;

    router.push(newPath);
    router.refresh();
  };

  return (
    <Select  onValueChange={handleChange} value={currentLocale}>
      <SelectTrigger className="">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <US title="United States" className="inline-block mr-2 w-5 h-5" />
          <span className="hidden sm:inline">English</span>
        </SelectItem>
        <SelectItem value="id">
          <ID title="Indonesia" className="inline-block mr-2 w-5 h-5" />
          <span className="hidden sm:inline ">Indonesian</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}