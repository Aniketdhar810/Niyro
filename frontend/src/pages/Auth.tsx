import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation placeholder for email/password auth
    console.log("Email sign in clicked");
  };

  if (loading) return null; // or a loading spinner

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      {/* Auth Card */}
      <div className="relative w-full max-w-[420px] bg-white border-border-width border-[#0A0A0A] p-6 md:p-8 shadow-[4px_4px_0px_#1c1b1b]">
        
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyIr2NCRCN6n2xUoQCbwBXcULqwc5w-6zqx5bW3Tp-tpbjpCkL9iNTB8YoeZBFR7dWolOBVLjKjvfuYG5Tc5KoIytBm7kqa8QxKn77AlZAtHUxVtxlP4GYaP9iOVlSGG7poMQAwRPVFLxJIMmWPjhQmQC1djCVv3m3hPfjg4vrUUtol2Wp_xqAHjeGoLrJJTqgZlIbTb1ED2LO53UhW21aXR7HkYVUCfQ1GfbVmgaDTaAq2HMdJMiXiw0HumUn12hV2Lo" 
              alt="Niyro Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mb-2">WELCOME BACK</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your Niyro account.</p>
        </div>
        
        {/* Social Login */}
        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-primary border-border-width border-[#0A0A0A] rounded-full py-3 px-6 mb-6 text-white group shadow-[4px_4px_0px_#1c1b1b] transition-all hover:shadow-[8px_8px_0px_#1c1b1b] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[0px_0px_0px_#1c1b1b] active:translate-y-1 active:translate-x-1"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
          </svg>
          <span className="font-label-mono text-label-mono font-bold">Continue with Google</span>
        </button>
        
        {/* Divider */}
        <div className="relative flex items-center py-5 mb-4">
          <div className="flex-grow border-t border-[#0A0A0A]"></div>
          <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-mono text-label-mono-sm uppercase">or</span>
          <div className="flex-grow border-t border-[#0A0A0A]"></div>
        </div>
        
        {/* Form */}
        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <div className="space-y-2">
            <label className="font-label-mono text-label-mono-sm font-bold block" htmlFor="email">Email Address</label>
            <input 
              className="w-full bg-white border-border-width border-[#0A0A0A] rounded px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-border-width-heavy focus:border-primary transition-colors" 
              id="email" 
              placeholder="hello@example.com" 
              required 
              type="email" 
            />
          </div>
          <div className="space-y-2 mb-6">
            <label className="font-label-mono text-label-mono-sm font-bold block" htmlFor="password">Password</label>
            <input 
              className="w-full bg-white border-border-width border-[#0A0A0A] rounded px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-border-width-heavy focus:border-primary transition-colors" 
              id="password" 
              placeholder="••••••••" 
              required 
              type="password" 
            />
          </div>
          
          {/* Submit */}
          <button 
            type="submit"
            className="w-full bg-[#0A0A0A] text-white rounded-full py-3 px-6 font-label-mono text-label-mono font-bold mt-6 mb-8 hover:bg-surface-variant hover:text-[#0A0A0A] border-border-width border-[#0A0A0A] transition-all shadow-[4px_4px_0px_#1c1b1b] active:shadow-[0px_0px_0px_#1c1b1b] active:translate-y-1 active:translate-x-1"
          >
            Sign In
          </button>
        </form>
        
        {/* Footer Link */}
        <div className="text-center mt-6">
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline decoration-2 underline-offset-4 font-medium transition-colors" href="#">
            Don't have an account? Create one
          </a>
        </div>
      </div>
    </div>
  );
};
