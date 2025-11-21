
import React, { useState } from 'react';
import { X, ChevronRight, Check, Sparkles, Heart, PlusSquare, Feather, ArrowRight, ArrowLeft } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
  t: any;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, t }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const steps = [
    {
      icon: Feather,
      color: 'text-black dark:text-white',
      bg: 'bg-gray-100 dark:bg-zinc-800',
      title: t.tutorial.step1Title,
      desc: t.tutorial.step1Desc,
    },
    {
      icon: PlusSquare,
      color: 'text-black dark:text-white',
      bg: 'bg-gray-100 dark:bg-zinc-800',
      title: t.tutorial.step2Title,
      desc: t.tutorial.step2Desc,
    },
    {
      icon: Sparkles,
      color: 'text-black dark:text-white',
      bg: 'bg-gray-100 dark:bg-zinc-800',
      title: t.tutorial.step3Title,
      desc: t.tutorial.step3Desc,
    },
    {
      icon: Heart,
      color: 'text-black dark:text-white',
      bg: 'bg-gray-100 dark:bg-zinc-800',
      title: t.tutorial.step4Title,
      desc: t.tutorial.step4Desc,
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[400px] animate-slide-up">
        
        {/* Skip Button */}
        <div className="absolute top-6 right-6 z-20">
          <button onClick={handleFinish} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            {t.tutorial.skip}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
          
          {/* Animated Icon Background */}
          <div key={step} className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 animate-heart-pop ${steps[step].bg}`}>
             <CurrentIcon size={40} className={steps[step].color} />
          </div>

          {/* Text Content */}
          <div key={`text-${step}`} className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-3 dark:text-white leading-tight">
                {steps[step].title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                {steps[step].desc}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 pt-0 flex flex-col gap-6">
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-black dark:bg-white' : 'w-1.5 bg-gray-200 dark:bg-zinc-800'}`}
                    />
                ))}
            </div>

            {/* Action Button */}
            <button 
                onClick={handleNext}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {step === steps.length - 1 ? (
                    <><span>{t.tutorial.finish}</span> <Check size={20}/></>
                ) : (
                    <><span>{t.tutorial.next}</span> {document.dir === 'rtl' ? <ArrowLeft size={20}/> : <ArrowRight size={20}/>}</>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
