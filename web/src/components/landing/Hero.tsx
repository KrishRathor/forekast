import { useEffect, useRef } from 'react';
import { TrendingUp, BarChart2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    let particles: { x: number; y: number; radius: number; speed: number; color: string; direction: number }[] = [];

    const createParticles = () => {

      particles = [];
      const particleCount = Math.floor(canvas.width * 0.05);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.2,
          color: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 255}, ${Math.random() * 0.3 + 0.2})`,
          direction: Math.random() * Math.PI * 2
        });
      }
    };

    createParticles();
    window.addEventListener('resize', createParticles);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.direction = Math.PI - particle.direction;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.direction = -particle.direction;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', createParticles);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 z-10"></div>

      <div className="container mx-auto px-6 z-20 relative">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block">Trade on</span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Opinions, Not Assets</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 leading-relaxed">
              Forekast is a revolutionary platform where you can trade on market opinions,
              forecasts, and predictions. Turn your market insights into profit.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  navigate('/markets')
                }}
                className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 transition-colors text-white font-semibold px-6 py-3 rounded-md shadow-lg hover:shadow-indigo-600/20">
                Start Trading Now
              </button>
            </div>
            <div className="mt-12 flex items-center space-x-6">
              <div className="flex items-center">
                <div className="bg-indigo-500/20 p-2 rounded-full">
                  <TrendingUp size={20} className="text-indigo-400" />
                </div>
                <span className="ml-2 text-gray-300">10k+ Traders</span>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <BarChart2 size={20} className="text-purple-400" />
                </div>
                <span className="ml-2 text-gray-300">$2M+ Volume</span>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="relative">
              {/* Hero image/graphic */}
              <div className="w-full h-[400px] bg-gradient-to-br from-indigo-600/30 to-purple-800/30 rounded-xl backdrop-blur-sm border border-gray-800 shadow-2xl flex items-center justify-center">
                <div className="p-8 bg-[#0E0F14]/80 rounded-lg border border-gray-800 shadow-lg max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <DollarSign size={20} className="text-green-500 mr-2" />
                    Live Market Opinion
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span>Bitcoin Above $75k (Jun)</span>
                      <span className="text-green-500">64%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span>Tesla Q2 Earnings Beat</span>
                      <span className="text-red-500">41%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span>Fed Rate Cut by July</span>
                      <span className="text-green-500">78%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/markets")
                    }}
                    className="mt-6 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-md transition-colors"
                  >
                    Join the Market
                  </button>
                </div>
              </div>

              <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-700/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

