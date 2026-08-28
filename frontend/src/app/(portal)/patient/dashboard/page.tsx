"use client";

import { useState, useEffect } from 'react';
import { 
  HeartPulse, Calendar, Video, FileText, Pill, AlertCircle, ArrowRight, Activity, 
  Thermometer, Lightbulb, Sparkles, RefreshCw, ShieldCheck, Heart, Zap
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface HealthTip {
  title: string;
  category: string;
  advice: string;
}

const HEALTH_TIPS: HealthTip[] = [
  {
    title: "Optimize Blood Pressure with Dietary Nitrates",
    category: "Cardiovascular Health",
    advice: "Dietary nitrates found in beets, spinach, and arugula convert into nitric oxide in the body, dilating arteries and naturally easing systolic blood pressure."
  },
  {
    title: "The 20-20-20 Rule for Digital Eye Strain",
    category: "Vision Care",
    advice: "Every 20 minutes of screen time, gaze at an object at least 20 feet away for 20 seconds. This relaxes your ciliary eye muscles and prevents digital fatigue."
  },
  {
    title: "Reset Your Circadian Clock with Morning Light",
    category: "Sleep Architecture",
    advice: "Viewing 10–15 minutes of natural morning sunlight within 30 minutes of waking triggers healthy cortisol timing and elevates restorative nighttime melatonin release."
  },
  {
    title: "Nurture Gut Microbiota with Fermented Foods",
    category: "Gut Microbiome",
    advice: "Consuming kefir, plain Greek yogurt, kimchi, or sauerkraut introduces diverse probiotic strains that enhance digestive enzyme production and boost immune defense."
  },
  {
    title: "Lower Acute Stress with Physiological Sighs",
    category: "Nervous System",
    advice: "Take two rapid deep inhales through your nose followed by one long, slow exhale through your mouth. Doing this 3 times activates the vagus nerve and lowers heart rate."
  },
  {
    title: "Post-Meal 10-Minute Walks for Glucose Stability",
    category: "Metabolic Wellness",
    advice: "A light 10-minute walk right after lunch or dinner encourages skeletal muscles to uptake circulating glucose directly, preventing rapid insulin spikes."
  },
  {
    title: "Hydrate with Electrolytes, Not Just Plain Water",
    category: "Hydration Science",
    advice: "Adding a pinch of unrefined mineral salt or fresh lemon to your morning water supports cellular hydration, adrenal balance, and nerve transmission."
  },
  {
    title: "Joint Cartilage Protection with Curcumin",
    category: "Musculoskeletal",
    advice: "Curcumin, the active antioxidant in turmeric, is a natural anti-inflammatory. Pairing it with a dash of black pepper enhances its bio-availability by up to 2,000%."
  },
  {
    title: "Synergy of Vitamin D3 & Vitamin K2",
    category: "Immunity & Bone Health",
    advice: "Vitamin D3 regulates immune defense and calcium absorption. Pairing it with Vitamin K2 ensures absorbed calcium goes into bone matrix rather than arterial walls."
  },
  {
    title: "Cognitive Focus & Brain DHA Phospholipids",
    category: "Neurological Care",
    advice: "Docosahexaenoic acid (DHA) constitutes over 40% of brain fatty acids. Consuming omega-3 rich fish, walnuts, or flaxseeds supports synaptic neuroplasticity."
  },
  {
    title: "Ergonomic Neck Posture & Spinal Alignment",
    category: "Physical Posture",
    advice: "Tilting your head forward at 45 degrees places 49 pounds of stress on cervical vertebrae. Position digital screens at eye level to eliminate chronic neck tension."
  },
  {
    title: "Overnight Fasting & Cellular Autophagy",
    category: "Metabolic Longevity",
    advice: "Allowing a consistent 12–14 hour fasting window between dinner and breakfast supports cellular autophagy—clearing out damaged proteins and metabolic debris."
  },
  {
    title: "Cold Water Face Splash for Acute Calm",
    category: "Stress Resilience",
    advice: "Splashing cool water on your face stimulates the mammalian dive reflex, engaging the parasympathetic nervous system and slowing an elevated pulse within seconds."
  },
  {
    title: "Liver Detoxification with Sulforaphane",
    category: "Hepatic Health",
    advice: "Broccoli sprouts, cauliflower, and Brussels sprouts are rich in sulforaphane, a potent phytonutrient that induces Phase II liver detoxification pathways."
  },
  {
    title: "Block Blue Light 90 Minutes Before Bed",
    category: "Sleep Hygiene",
    advice: "High-energy blue wavelengths from screens suppress pineal melatonin by up to 80%. Switch to warm night mode or blue-light blocking lenses after sunset."
  },
  {
    title: "Soluble Fiber for Arterial & Heart Defense",
    category: "Cardiovascular Care",
    advice: "Eating 30–35g of prebiotic soluble fiber daily from oats, chia seeds, and legumes binds excess cholesterol in the digestive tract and aids smooth excretion."
  },
  {
    title: "Zone 2 Low-Intensity Cardio for Mitochondria",
    category: "Aerobic Capacity",
    advice: "30–40 minutes of steady, conversational-pace exercise twice a week increases mitochondrial density and boosts cellular fat oxidation efficiency."
  },
  {
    title: "Diaphragmatic Nasal Breathing for Oxygenation",
    category: "Respiratory Wellness",
    advice: "Inhaling through the nose generates endogenous nitric oxide in the sinuses, increasing pulmonary oxygen uptake by 10–18% compared to mouth breathing."
  },
  {
    title: "Antioxidant Defense with Dark Berry Polyphenols",
    category: "Cellular Longevity",
    advice: "Blueberries and blackberries are loaded with anthocyanins that cross the blood-brain barrier to scavenge free radicals and reduce neuro-inflammation."
  },
  {
    title: "Kidney Filtration & Pale-Straw Hydration",
    category: "Renal Function",
    advice: "Aim for a pale-straw urine color. Consistent hydration throughout the day prevents mineral crystallization and supports efficient kidney waste filtration."
  },
  {
    title: "Grip Strength as a Biomarker of Vitality",
    category: "Functional Fitness",
    advice: "Handgrip strength strongly correlates with cardiovascular resilience and longevity. Incorporate hanging from a bar or carrying weights weekly."
  },
  {
    title: "Avoid Liquid Fructose & Sugar-Sweetened Drinks",
    category: "Metabolic Care",
    advice: "Excess liquid fructose is metabolized almost exclusively by the liver into triglycerides, which can lead to fatty liver changes and insulin resistance."
  },
  {
    title: "Protein-Rich Breakfast to Curb Sugar Cravings",
    category: "Nutritional Science",
    advice: "Starting your day with 25–30g of protein stabilizes morning blood sugar, suppresses ghrelin (hunger hormone), and prevents afternoon fatigue."
  },
  {
    title: "Cool Bedroom Temperature for Deep Slow-Wave Sleep",
    category: "Sleep Science",
    advice: "Maintaining a bedroom temperature around 18–20°C (65–68°F) assists your core body temperature in dropping 1°C, the essential trigger for deep sleep cycles."
  },
  {
    title: "Zinc & Vitamin C for White Blood Cell Activity",
    category: "Immune Support",
    advice: "Zinc ions assist in white blood cell maturation while Vitamin C concentrates in phagocytes to enhance the body's natural defense response."
  },
  {
    title: "Broad-Spectrum SPF 30+ for Skin Health",
    category: "Dermatology",
    advice: "Ultraviolet A rays penetrate cloud cover and glass, degrading collagen fibers. Daily broad-spectrum SPF shields your skin from photo-aging and cellular damage."
  },
  {
    title: "Mindful Eating Away from Screens",
    category: "Digestive Care",
    advice: "Eating without television or phone distractions stimulates the cephalic phase of digestion, resulting in higher enzyme secretion and better satiety signaling."
  },
  {
    title: "Magnesium Glycinate for Muscle & Nerve Calm",
    category: "Micronutrients",
    advice: "Magnesium supports over 300 enzymatic reactions. Taking magnesium glycinate in the evening relaxes muscle tension and calms neurotransmitter activity."
  },
  {
    title: "Routine Health Screenings for Preventive Wellness",
    category: "Preventive Medicine",
    advice: "Annual checks of lipid panels, blood pressure, and HbA1c identify silent metabolic shifts years before symptoms appear, enabling proactive lifestyle fixes."
  },
  {
    title: "Micro-Breaks for Sustained Prefrontal Clarity",
    category: "Cognitive Endurance",
    advice: "Stepping away from demanding mental tasks for 5 minutes every hour prevents mental fatigue and restores decision-making sharpness."
  }
];

function getNextUniqueTip(): HealthTip {
  if (typeof window === 'undefined') return HEALTH_TIPS[0];
  const storageKey = 'healthconnect_shown_tip_indices_v2';
  let shownIndices: number[] = [];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) shownIndices = JSON.parse(stored);
  } catch {}

  const allIndices = HEALTH_TIPS.map((_, i) => i);
  let availableIndices = allIndices.filter(i => !shownIndices.includes(i));

  // If all tips in the library have been shown, reset the pool
  if (availableIndices.length === 0) {
    shownIndices = [];
    availableIndices = allIndices;
  }

  // Randomly pick one from the unshown pool
  const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  shownIndices.push(chosenIndex);

  try {
    localStorage.setItem(storageKey, JSON.stringify(shownIndices));
  } catch {}

  return HEALTH_TIPS[chosenIndex];
}

function HealthTipCard() {
  const [tip, setTip] = useState<HealthTip>(HEALTH_TIPS[0]);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setTip(getNextUniqueTip());
  }, []);

  const handleGetFreshTip = () => {
    setIsRotating(true);
    setTimeout(() => {
      setTip(getNextUniqueTip());
      setIsRotating(false);
    }, 250);
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-sm border border-teal-500/30 bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 text-white overflow-hidden relative rounded-3xl">
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

      <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl sm:text-2xl text-white font-extrabold tracking-tight">
              Your Health is Our Priority
            </CardTitle>
            <Badge className="bg-teal-950/80 text-teal-200 border-teal-400/40 text-[10px] px-2 py-0.5 hidden sm:inline-flex">
              Daily Rotating Advice
            </Badge>
          </div>
          <CardDescription className="text-teal-100/90 text-xs mt-0.5">
            Evidence-based medical tips updated on every visit.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleGetFreshTip}
          className="border-white/40 text-white hover:bg-white/20 text-xs h-8 px-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Click to see a new health tip"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Fresh Advice</span>
        </Button>
      </CardHeader>

      <CardContent className="relative z-10 pb-5 pt-1">
        <div className="bg-slate-950/40 border border-white/20 p-4 sm:p-5 rounded-2xl backdrop-blur-md transition-all duration-300">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-300 shadow-inner">
              <Lightbulb className="h-5 w-5" />
            </div>
            
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  {tip.title}
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </h3>
                <Badge className="bg-teal-950/70 text-teal-200 border-teal-400/30 text-[10px] font-semibold px-2 py-0.5">
                  {tip.category}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-teal-50 leading-relaxed font-medium">
                {tip.advice}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/users/me');
        return response.data;
      } catch {
        return null;
      }
    }
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'patient'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/appointments/patient');
        return response.data;
      } catch {
        return [];
      }
    }
  });

  const queryClient = useQueryClient();

  const { data: todayReminders = [], isLoading: isLoadingReminders } = useQuery({
    queryKey: ['prescriptions', 'reminders', 'today'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/prescriptions/patient/reminders/today');
        return response.data;
      } catch {
        return [];
      }
    }
  });

  const handleMarkTaken = async (id: string, name: string) => {
    try {
      await api.patch(`/api/prescriptions/reminders/${id}/taken`);
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'reminders', 'today'] });
      toast.add({
        title: 'Dose Recorded',
        description: `Successfully marked ${name} as taken!`,
        type: 'success',
      });
    } catch {
      toast.add({ title: 'Error', description: 'Failed to record dose.', type: 'error' });
    }
  };

  const handleSkipDose = async (id: string, name: string) => {
    const reason = prompt(`Reason for skipping ${name}? (Optional):`) || 'Skipped by patient';
    try {
      await api.patch(`/api/prescriptions/reminders/${id}/skip`, { reason });
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'reminders', 'today'] });
      toast.add({
        title: 'Dose Skipped',
        description: `${name} has been marked as skipped.`,
        type: 'info',
      });
    } catch {
      toast.add({ title: 'Error', description: 'Failed to skip dose.', type: 'error' });
    }
  };

  const nextAppointment = (appointments || []).find((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* High Priority Red Alert Area */}
      <div className="bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-500/60 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h3 className="text-red-800 dark:text-red-400 font-bold text-sm">Action Required: Blood Test Results</h3>
          <p className="text-red-700 dark:text-red-300 text-xs leading-relaxed">
            Your recent lipid panel results show elevated cholesterol levels. Your doctor has requested a follow-up consultation.
          </p>
          <Link href="/doctors" className="inline-flex items-center text-red-600 dark:text-red-400 font-bold text-xs hover:underline pt-1">
            Book Consultation Now <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Hero 2-Column Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Left: Your Health is Our Priority with Fresh Non-Repeating Tips */}
        <HealthTipCard />

        {/* Right: AI Assistant Shortcut */}
        <Card className="col-span-1 shadow-sm border border-teal-500/30 bg-teal-800 text-white overflow-hidden relative rounded-3xl flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">AI</div>
              AI Health Assistant
            </CardTitle>
            <CardDescription className="text-teal-100 text-xs">Instantly check symptoms and get recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Feeling unwell? Describe your symptoms to our intelligent AI to understand potential causes and next steps.
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full bg-white text-teal-950 hover:bg-teal-50 font-bold text-xs h-9" asChild>
              <Link href="/patient/ai-assistant">Start Checkup <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Medicine Intake Reminder */}
      <Card className="shadow-xs border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-card rounded-2xl text-left">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Medicine Intake Reminder</CardTitle>
              <CardDescription className="text-[11px] text-slate-500 dark:text-gray-400">Today&apos;s medication schedule &amp; adherence tracker</CardDescription>
            </div>
          </div>

          <Link href="/patient/prescriptions" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">
            View All Prescriptions →
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingReminders ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Loading today&apos;s scheduled medicines...
            </div>
          ) : todayReminders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Pill className="w-8 h-8 text-teal-600/40 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Pending Doses for Today</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                All medications prescribed by your doctor during video consultations will automatically appear here with daily reminders.
              </p>
              <Button size="sm" variant="outline" className="text-xs h-8 border-slate-300 dark:border-slate-700" asChild>
                <Link href="/patient/prescriptions">Browse Prescription Archive</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {todayReminders.map((dose: any) => {
                const isTaken = dose.adherenceStatus === 'TAKEN';
                const isSkipped = dose.adherenceStatus === 'SKIPPED';
                const isPending = dose.adherenceStatus === 'PENDING';

                return (
                  <div 
                    key={dose.id} 
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                      isTaken
                        ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/20'
                        : isSkipped
                        ? 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-75'
                        : 'border-amber-300 dark:border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/20 ring-1 ring-amber-300 dark:ring-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          isTaken ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' :
                          isSkipped ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' :
                          'bg-amber-100 dark:bg-amber-900/50 text-amber-600 animate-pulse'
                        }`}>
                          <Pill className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{dose.medicineName}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400">{dose.dosage}</p>
                        </div>
                      </div>

                      <Badge className={`shrink-0 text-[9px] px-2 py-0.5 ${
                        isTaken ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300' :
                        isSkipped ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                      }`}>
                        {isTaken ? '✓ Taken' : isSkipped ? 'Skipped' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex justify-between">
                        <span>⏰ <strong>{dose.scheduledTime}</strong></span>
                        <span className="font-mono text-teal-600 dark:text-teal-400">Day {dose.dayNumber} of {dose.totalDays}</span>
                      </div>
                      {dose.instructions && (
                        <div className="text-slate-500 dark:text-slate-400 truncate">
                          🍽 {dose.instructions}
                        </div>
                      )}
                      {dose.takenAt && (
                        <div className="text-[9px] text-emerald-600 dark:text-emerald-400">
                          Logged at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleMarkTaken(dose.id, dose.medicineName)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] h-7 rounded-xl shadow-xs cursor-pointer"
                        >
                          Mark as Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkipDose(dose.id, dose.medicineName)}
                          className="text-[10px] h-7 px-2.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom 3-Column Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
        
        {/* 1. Upcoming Appointment */}
        <Card className="shadow-xs border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-card rounded-2xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-border/50">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent className="py-5">
            {nextAppointment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-500/30">
                  <Avatar className="h-10 w-10 border border-teal-500/40 shrink-0">
                    <AvatarFallback className="bg-teal-600 text-white font-bold text-xs">
                      {(nextAppointment.doctor?.fullName || 'Doctor')
                        .replace(/^Dr\.?\s*/i, '')
                        .substring(0, 2)
                        .toUpperCase() || 'DR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {nextAppointment.doctor?.fullName || 'Doctor'}
                      </p>
                      {nextAppointment.status === 'CONFIRMED' && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0 font-bold shrink-0">
                          Confirmed
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                      {nextAppointment.doctor?.specialization || 'General Physician'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">
                      {new Date(nextAppointment.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(nextAppointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {(nextAppointment.status === 'CONFIRMED' || nextAppointment.status === 'IN_PROGRESS') && (
                  <Link href={`/video-consultation/${nextAppointment.videoRoomId || nextAppointment.id}`} className="block">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <Video className="w-3.5 h-3.5" />
                      Enter Video Consultation Room
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 dark:text-gray-400 text-xs">
                <p>No upcoming appointments</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Book your next consultation with our certified doctors</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-100 dark:border-border/50 pt-3">
            <Button variant="ghost" className="w-full text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs h-8" asChild>
              <Link href="/patient/appointments">View Schedule <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 2. Recent Medical Reports */}
        <Card className="shadow-xs border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-card rounded-2xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-border/50">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Recent Medical Reports</CardTitle>
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent className="py-4 space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-700 dark:text-teal-400 text-xs font-bold">PDF</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Comprehensive Lipid Profile</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">Dr. Dharm Patel • Apex Labs</p>
                </div>
              </div>
              <Badge className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/40 text-[10px]">High</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-700 dark:text-teal-400 text-xs font-bold">PDF</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Annual Complete Blood Count (CBC)</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">Dr. Dharm Patel • Apex Labs</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-[10px]">Normal</Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 dark:border-border/50 pt-3">
            <Button variant="ghost" className="w-full text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs h-8" asChild>
              <Link href="/patient/records">View All Reports <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 3. Active Prescriptions */}
        <Card className="shadow-xs border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-card rounded-2xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-border/50">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Active Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent className="py-4 space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Atorvastatin 20mg</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">1 tablet daily at night • Refill: 15 days left</p>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-[10px]">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Lisinopril 10mg</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">1 tablet in morning • Refill: 20 days left</p>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 text-[10px]">Active</Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 dark:border-border/50 pt-3">
            <Button variant="ghost" className="w-full text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs h-8" asChild>
              <Link href="/patient/prescriptions">Manage Prescriptions <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </CardFooter>
        </Card>

      </div>

    </div>
  );
}
