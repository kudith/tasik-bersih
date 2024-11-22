"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TbMessageReportFilled } from "react-icons/tb";
import { useTranslation } from "react-i18next";

// Import SkeletonReportAlert
import { SkeletonReportAlert } from "@/components/skeleton/SkeletonReportAlert";

const ReportAlert = () => {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/report-isue?locale=${locale}&populate=*`
        );
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError(t("error_loading_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale, t]);

  const handleReportClick = () => {
    router.push(`/${locale}/report`);
  };

  if (loading) {
    return <SkeletonReportAlert />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-primary/30 via-white to-primary/30">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const { title, text } = data;

  return (
    <motion.div
      className="p-4 md:p-10 max-w-4xl mx-auto flex items-center justify-center flex-col text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h2 className="text-2xl md:text-4xl font-bold mb-2">{title}</h2>
      <p className="text-gray-700 text-lg md:text-xl mb-4">{text}</p>
      <Button className="px-4 py-2 md:px-8 hover:bg-black md:py-6 text-lg md:text-xl flex items-center" onClick={handleReportClick}>
        <TbMessageReportFilled className="mr-2" />
        {t("report")}
      </Button>
    </motion.div>
  );
};

export default ReportAlert;