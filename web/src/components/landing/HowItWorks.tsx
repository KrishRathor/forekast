import { LightbulbIcon, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorks = () => {

  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Choose Your Opinion",
      description: "Browse available markets or create your own prediction. From crypto prices to sports outcomes, if there's an opinion, there's a market.",
      icon: <LightbulbIcon className="h-6 w-6 text-indigo-500" />
    },
    {
      number: "02",
      title: "Place Your Trade",
      description: "Buy or sell positions based on your market prediction. Use our analytics tools to make informed decisions.",
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />
    },
    {
      number: "03",
      title: "Collect Your Profits",
      description: "When your prediction is correct, profit is automatically credited to your account with no delays or complications.",
      icon: <CheckCircle className="h-6 w-6 text-indigo-500" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-gradient-to-b from-[#0E0F14] via-[#10111a] to-[#0E0F14]">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              How forekast Works
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Getting started is simple. Follow these steps to begin trading on opinions and predictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-8 hover:border-indigo-900 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-700/10"
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                {step.number}
              </div>
              <div className="bg-indigo-800/20 p-3 rounded-lg w-fit mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-400 mb-6">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-indigo-500 z-10">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => {
              navigate("/markets")
            }}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-8 py-3 rounded-md shadow-lg hover:shadow-indigo-600/20"
          >
            Start Trading Now
          </button>
        </div>
      </div>
    </section>
  );
};

