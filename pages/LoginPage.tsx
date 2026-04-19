import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Building2, ChevronDown } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface LoginPageProps {
  onLogin: (username: string, password?: string, setError?: (msg: string) => void) => void;
  users: any[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // List of all mock roles for testing
  const mockCreds = [
    { role: 'Super Admin', user: 'admin', pass: '123456', color: 'text-purple-400' },
    { role: 'HR Admin', user: 'jdoe', pass: '123456', color: 'text-pink-400' },
    { role: 'Developer', user: 'asmith', pass: '123456', color: 'text-emerald-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username or Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      onLogin(username, password, setError);
      setLoading(false);
    }, 1000);
  };

  const fillCreds = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-dark-950">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-600/5 blur-[100px]"></div>
        <div className="absolute top-[40%] left-[20%] w-[2px] h-[100px] bg-gradient-to-b from-transparent via-primary-500 to-transparent opacity-20 rotate-45"></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex flex-col lg:flex-row items-center justify-center relative z-10 gap-6 lg:gap-24">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col flex-1 max-w-xl space-y-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-md mb-6">
               <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
               <span className="text-xs font-bold text-primary-400 tracking-wider uppercase">Enterprise Edition V2</span>
            </div>
            
            <h1 className="text-7xl font-black tracking-tight text-white leading-[1.1]">
              EETTI <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600">TECH</span>
            </h1>
            <p className="text-xl text-slate-400 mt-6 max-w-lg leading-relaxed">
              Experience the next generation of corporate management. Streamline attendance, projects, and workforce analytics in one luxury interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-dark-800/50 border border-white/5 backdrop-blur-sm hover:bg-dark-800 transition-colors group">
              <ShieldCheck className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold text-base">Military-Grade Security</h3>
              <p className="text-xs text-slate-500 mt-1">End-to-end encrypted data transmission.</p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-800/50 border border-white/5 backdrop-blur-sm hover:bg-dark-800 transition-colors group">
              <Building2 className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold text-base">Corporate Compliance</h3>
              <p className="text-xs text-slate-500 mt-1">Automated payroll locking & audit trails.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md flex flex-col gap-4">
          
          <div className="relative group">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative p-8 bg-dark-900 border border-white/10 rounded-2xl shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-slate-400 text-sm">Access your EETTI TECH dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <Input 
                    label="Username or Email"
                    type="text"
                    placeholder="Enter username or email"
                    icon={<User size={18} />}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    error={error === 'Username or Email is required' ? error : ''}
                    className="bg-dark-800 border-dark-700 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                  
                  <div className="space-y-1">
                    <Input 
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock size={18} />}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      error={error && error !== 'Username or Email is required' ? error : ''}
                      className="bg-dark-800 border-dark-700 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-primary-500/20"
                    />
                    <div className="flex justify-end pt-1">
                      <a href="#" className="text-xs text-primary-500 hover:text-primary-400 transition-colors font-medium">Forgot password?</a>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-black font-bold h-11 text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] border-none"
                  isLoading={loading}
                >
                  <span className="flex items-center">
                    Secure Login <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </Button>
              </form>
            </div>
          </div>

          {/* Test Credentials Box */}
          <div className="bg-dark-900/80 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Test Access</span>
                <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Password: 123456</span>
             </div>
             <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                {mockCreds.map((cred) => (
                  <button 
                    key={cred.user}
                    onClick={() => fillCreds(cred.user, cred.pass)}
                    className="flex items-center justify-between px-3 py-2 rounded bg-dark-800 border border-dark-700 hover:bg-dark-700 hover:border-primary-500/30 transition-all text-left group"
                  >
                     <div className="flex flex-col">
                       <span className={`text-[10px] font-bold ${cred.color}`}>{cred.role}</span>
                       <span className="text-xs text-slate-400 font-mono group-hover:text-white">{cred.user}</span>
                     </div>
                     <ChevronDown className="-rotate-90 text-dark-600 group-hover:text-primary-500 w-3 h-3" />
                  </button>
                ))}
             </div>
          </div>
          
          <div className="text-center lg:hidden">
            <p className="text-slate-500 text-xs font-semibold">EETTI TECH SYSTEM V2.0</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;