import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBrand } from '../redux/adminSlice';
import { Zap, ShieldCheck, ArrowRight, Layers, Database, Activity, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

const BrandPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminUser } = useSelector((state) => state.admin);

  const handleSelectBrand = (brand) => {
    dispatch(setSelectedBrand(brand));
    navigate('/parts');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-900 text-white p-6 md:p-12 flex flex-col justify-center items-center relative overflow-hidden select-none">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Welcome & Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              TecDoc Pegasus 3.0 Enterprise Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
            Choose Catalog System
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto mt-3">
            Welcome back, <span className="text-white font-bold">{adminUser?.name || 'Administrator'}</span>. Select a dedicated brand catalog to explore verified OE parts, technical specifications, and fitment.
          </p>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1: NGK & NTK (Green Theme) */}
          <div
            onClick={() => handleSelectBrand('ngk')}
            className="group relative bg-[#131929] hover:bg-[#152332] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent line: NGK Green */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-[#008752] to-teal-500"></div>

            <div>
              {/* Badge & Supplier ID */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  TecDoc Suppliers #15 & #5414
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Premier Data Supplier
                </span>
              </div>

              {/* Brand Logo & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/95 rounded-xl p-2 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500/30">
                  <img
                    src="/images/branding/ngk_logo.png"
                    alt="NGK SPARK PLUG"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                    NGK & NTK
                  </h2>
                  <p className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">
                    Niterra EMEA Automotive
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
                Industry-standard OE Ignition Systems, Laser Iridium & Nickel Spark Plugs, D-Power Glow Plugs, Ignition Coils, and NTK Lambda / Oxygen Sensors.
              </p>

              {/* Statistics Pill Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">Ignition & Plugs</span>
                  </div>
                  <span className="text-lg font-black text-white">3,993+</span>
                  <span className="text-[10px] text-slate-400 block">Active Articles</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-teal-400 mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">NTK Sensors</span>
                  </div>
                  <span className="text-lg font-black text-white">3,334+</span>
                  <span className="text-[10px] text-slate-400 block">Electronics Parts</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-300 transition-colors">
                Launch NGK Catalog
              </span>
              <div className="w-9 h-9 rounded-lg bg-[#008752] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md shadow-emerald-600/30">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: KYB (Red Theme) */}
          <div
            onClick={() => handleSelectBrand('kyb')}
            className="group relative bg-[#131929] hover:bg-[#20161a] border border-slate-800 hover:border-red-600/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/40 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent line: KYB Red */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#E31837] to-rose-700"></div>

            <div>
              {/* Badge & Supplier ID */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600/10 text-red-400 border border-red-600/20">
                  TecDoc Supplier #7729
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Certified Data Supplier
                </span>
              </div>

              {/* Brand Logo & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-16 bg-white/95 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-red-900/30 ring-2 ring-red-500/30">
                  <img
                    src="/images/branding/kyb_logo.png"
                    alt="KYB SUSPENSION"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-red-400 transition-colors">
                    KYB Suspension
                  </h2>
                  <p className="text-xs font-semibold text-red-400/90 uppercase tracking-wider">
                    Our Precision, Your Advantage
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
                World-leading suspension and damping systems: Excel-G Twin-Tube Gas Shock Absorbers, Gas-A-Just Heavy-Duty Monotube Dampers, Premium Struts, and Coil Springs.
              </p>

              {/* Statistics Pill Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-red-400 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">Shock Absorbers</span>
                  </div>
                  <span className="text-lg font-black text-white">1,908+</span>
                  <span className="text-[10px] text-slate-400 block">Damping Units</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">OE References</span>
                  </div>
                  <span className="text-lg font-black text-white">100%</span>
                  <span className="text-[10px] text-slate-400 block">ISO/IATF 16949</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 group-hover:text-red-300 transition-colors">
                Launch KYB Catalog
              </span>
              <div className="w-9 h-9 rounded-lg bg-[#E31837] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md shadow-red-600/30">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Global/Bypass Footer */}
        <div className="mt-10 text-center">
          <button
            onClick={() => handleSelectBrand(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Enter Unified System (All Brands)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandPortal;
