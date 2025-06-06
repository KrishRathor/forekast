import React from 'react';
import { TrendingUp, Shield, Zap, BarChart, UserPlus, DollarSign, Briefcase, LineChart } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-indigo-900 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-700/10 group">
    <div className="bg-indigo-800/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-indigo-800/40 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export const Features = () => {
  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
      title: "Opinion Markets",
      description: "Trade directly on market opinions and predictions with transparent pricing and instant settlement."
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with multi-factor authentication and advanced encryption for all transactions."
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-500" />,
      title: "Instant Execution",
      description: "Lightning-fast trade execution with minimal slippage and immediate settlement on all markets."
    },
    {
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      title: "Advanced Analytics",
      description: "Real-time market analysis, historical data, and predictive tools to inform your trading decisions."
    },
    {
      icon: <UserPlus className="h-6 w-6 text-indigo-500" />,
      title: "Social Trading",
      description: "Follow top traders, share insights, and learn from the community to improve your performance."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-indigo-500" />,
      title: "Commission-Free",
      description: "No hidden fees or commissions—we charge a small spread on each trade with complete transparency."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-indigo-500" />,
      title: "Portfolio Management",
      description: "Manage multiple positions across various opinion markets with intuitive portfolio tools."
    },
    {
      icon: <LineChart className="h-6 w-6 text-indigo-500" />,
      title: "Market Creation",
      description: "Create your own opinion markets and earn fees when others trade on your predictions."
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-900 to-transparent"></div>

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Trade Smarter with forekast 
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Our platform combines opinion markets with cutting-edge technology to provide a unique trading experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

