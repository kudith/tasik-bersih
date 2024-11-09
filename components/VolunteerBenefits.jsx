import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaHandsHelping, FaUsers, FaLightbulb, FaChartLine } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

const benefits = [
  {
    icon: FaHandsHelping,
    title: "Gain Valuable Experience",
    text: "Engage in meaningful work that boosts your professional journey and enriches your resume.",
  },
  {
    icon: FaUsers,
    title: "Build Lasting Connections",
    text: "Meet people with shared interests and expand your network for future opportunities.",
  },
  {
    icon: FaLightbulb,
    title: "Impact the Community",
    text: "Make a positive difference, creating lasting changes in people’s lives and the community.",
  },
  {
    icon: FaChartLine,
    title: "Develop New Skills",
    text: "Challenge yourself to learn new skills that can benefit your personal and professional growth.",
  },
];

export function VolunteerBenefits() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full max-w-3xl p-8 overflow-hidden"
    >
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">Why Volunteer?</CardTitle>
          <CardDescription className="text-xl opacity-90 hidden md:block">
            Discover how volunteering benefits you and the community
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
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-gray-500 opacity-90 hidden md:block">{benefit.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}