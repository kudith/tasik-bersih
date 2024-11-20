import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaHandsHelping, FaUsers, FaLightbulb, FaChartLine } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";

const benefits = [
  {
    icon: FaHandsHelping,
    titleKey: "gain_valuable_experience",
    textKey: "gain_valuable_experience_text",
  },
  {
    icon: FaUsers,
    titleKey: "build_lasting_connections",
    textKey: "build_lasting_connections_text",
  },
  {
    icon: FaLightbulb,
    titleKey: "impact_the_community",
    textKey: "impact_the_community_text",
  },
  {
    icon: FaChartLine,
    titleKey: "develop_new_skills",
    textKey: "develop_new_skills_text",
  },
];

export function VolunteerBenefits() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { t } = useTranslation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full max-w-3xl md:mt-7  p-8 overflow-hidden"
    >
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">{t("why_volunteer")}</CardTitle>
          <CardDescription className="text-xl opacity-90 hidden md:block">
            {t("discover_volunteering_benefits")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-8 mt-6">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                className="flex items-center space-x-6 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-opacity-90 bg-white bg-opacity-20 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.5 }}
              >
                <div className="p-4 rounded-full bg-opacity-20">
                  <benefit.icon className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t(benefit.titleKey)}</h3>
                  <p className="text-gray-500 opacity-90 hidden md:block">{t(benefit.textKey)}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}