import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { SideNav } from '../components/SideNav';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings, loading, toggleChannel } = useUserSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSyncing, setIsSyncing] = useState(false);

  const [riskAlerts, setRiskAlerts] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);
  const [autonomousActions, setAutonomousActions] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  
  const [workHoursStart, setWorkHoursStart] = useState('09:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('18:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [focusDuration, setFocusDuration] = useState(45);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const gmailJustConnected = searchParams.get('gmailConnected') === 'true';
  const gmailError = searchParams.get('gmailError');
  const slackJustConnected = searchParams.get('slackConnected') === 'true';
  const slackError = searchParams.get('slackError');

  useEffect(() => {
    if (gmailJustConnected) {
      navigate('/settings', { replace: true });
      alert('Gmail connected successfully!');
    } else if (gmailError) {
      navigate('/settings', { replace: true });
      alert('Failed to connect Gmail.');
    }
  }, [gmailJustConnected, gmailError, navigate]);

  useEffect(() => {
    if (settings?.workHours) {
      setWorkHoursStart(settings.workHours.start);
      setWorkHoursEnd(settings.workHours.end);
      setTimezone(settings.workHours.timezone);
    }
    if (settings?.notificationPrefs) {
      if (settings.notificationPrefs.riskAlerts !== undefined) setRiskAlerts(settings.notificationPrefs.riskAlerts);
      if (settings.notificationPrefs.dailyBriefing !== undefined) setDailyBriefing(settings.notificationPrefs.dailyBriefing);
      if (settings.notificationPrefs.autonomousActions !== undefined) setAutonomousActions(settings.notificationPrefs.autonomousActions);
    }
    if (settings?.focusPrefs) {
      if (settings.focusPrefs.durationMinutes !== undefined) setFocusDuration(settings.focusPrefs.durationMinutes);
    }
  }, [settings]);

  const handleTogglePref = async (key: 'riskAlerts' | 'dailyBriefing' | 'autonomousActions', value: boolean) => {
    if (key === 'riskAlerts') setRiskAlerts(value);
    if (key === 'dailyBriefing') setDailyBriefing(value);
    if (key === 'autonomousActions') setAutonomousActions(value);
    
    // @ts-ignore - updateSettings can merge partials
    await api.updateSettings({
      [`notificationPrefs.${key}`]: value
    });
  };

  // Handle Slack OAuth redirect feedback
  useEffect(() => {
    if (slackError === 'cancelled') {
      navigate('/settings', { replace: true });
      alert('Slack connection cancelled.');
    } else if (slackError) {
      navigate('/settings', { replace: true });
      alert('Failed to connect Slack.');
    } else if (slackJustConnected) {
      navigate('/settings', { replace: true });
      alert('Slack connected! Send messages to your Niyro bot to add tasks.');
    }
  }, [slackError, slackJustConnected, navigate]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: editName });
        setIsEditingProfile(false);
        // Force reload to get the updated name in the UI immediately without waiting for Firebase event
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to update profile');
      }
    }
  };

  const handleSaveWorkHours = async () => {
    setIsSavingHours(true);
    try {
      await api.updateSettings({
        workHours: {
          start: workHoursStart,
          end: workHoursEnd,
          timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        focusPrefs: {
          durationMinutes: focusDuration
        }
      });
      alert('Preferences saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences.');
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleGmailConnect = async () => {
    if (isConnected('gmail')) {
      // For MVP: maybe we just disconnect them in Firestore
      toggleChannel('gmail', false);
    } else {
      try {
        const { authUrl } = await api.getGoogleAuthUrl();
        window.location.href = authUrl;
      } catch (e) {
        console.error(e);
        alert('Failed to initiate Gmail connection.');
      }
    }
  };

  const handleGmailSync = async () => {
    setIsSyncing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/ingest/gmail/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully synced ${data.processed} tasks from Gmail!`);
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to sync with Gmail.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-border-width-heavy border-on-surface border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const isConnected = (channel: 'gmail' | 'telegram' | 'slack') => {
    return !!settings?.connectedChannels?.[channel];
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-margin-mobile md:p-margin-desktop flex flex-col gap-gutter max-w-7xl mx-auto w-full mb-12">
        {/* Header */}
        <header className="mb-8 border-b-border-width-heavy border-on-surface pb-6 relative">
          <h1 className="font-display-xl text-headline-lg-mobile md:text-[80px] text-on-surface uppercase tracking-tighter font-black">SYSTEM CONFIGURATION</h1>
          <p className="font-label-mono text-label-mono text-on-surface-variant mt-4 max-w-2xl uppercase">Manage integration pipelines, notification protocols, and base account parameters for Niyro AI.</p>
        </header>

        {/* Section 1: Connected Channels */}
        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 uppercase flex items-center gap-4 font-bold">
            <span className="bg-on-surface text-surface w-8 h-8 inline-flex items-center justify-center font-label-mono text-label-mono-sm">01</span>
            CONNECTED CHANNELS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Gmail */}
            <div className={`p-6 flex flex-col justify-between min-h-[200px] border-2 border-on-surface ${isConnected('gmail') ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 border-2 border-on-surface flex items-center justify-center ${isConnected('gmail') ? 'bg-surface-variant' : 'bg-surface'}`}>
                  <span className="material-symbols-outlined text-on-surface">mail</span>
                </div>
                {isConnected('gmail') ? (
                  <span className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">CONNECTED</span>
                ) : (
                  <span className="bg-transparent text-outline border-2 border-outline font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">NOT CONNECTED</span>
                )}
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] text-on-surface mb-1 font-bold">Gmail</h3>
                <p className="font-label-mono text-label-mono-sm text-on-surface-variant mb-6 uppercase">Syncs inbound tasks &amp; deadlines</p>
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={handleGmailConnect}
                    className={`font-label-mono text-label-mono px-4 py-2 flex-1 uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all ${isConnected('gmail') ? 'bg-surface text-on-surface' : 'bg-primary text-on-primary'}`}
                  >
                    {isConnected('gmail') ? 'Disconnect' : 'Connect'}
                  </button>
                  {isConnected('gmail') && (
                    <button 
                      onClick={handleGmailSync}
                      disabled={isSyncing}
                      className="font-label-mono text-label-mono px-4 py-2 flex-1 uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all bg-secondary-fixed text-on-secondary-fixed disabled:opacity-50"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  )}
                </div>
                {isConnected('gmail') && (
                  <div className="mt-2">
                    <p className="text-xs text-on-surface-variant font-label-mono uppercase">
                      \u2139\ufe0f Apply the <strong>Niyro</strong> label to any email in Gmail, then click Sync to turn them into tasks.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Slack */}
            <div className={`p-6 flex flex-col justify-between min-h-[200px] border-2 border-on-surface ${isConnected('slack') ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 border-2 border-on-surface flex items-center justify-center ${isConnected('slack') ? 'bg-surface-variant' : 'bg-surface'}`}>
                  <span className="material-symbols-outlined text-on-surface">forum</span>
                </div>
                {isConnected('slack') ? (
                  <span className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">CONNECTED</span>
                ) : (
                  <span className="bg-transparent text-outline border-2 border-outline font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">NOT CONNECTED</span>
                )}
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] text-on-surface mb-1 font-bold">Slack</h3>
                <p className="font-label-mono text-label-mono-sm text-on-surface-variant mb-6 uppercase">Monitors project channels</p>
                <button 
                  onClick={async () => {
                    if (isConnected('slack')) {
                      try {
                        await api.disconnectSlack();
                        toggleChannel('slack', false);
                      } catch (err) {
                        alert('Failed to disconnect Slack');
                      }
                    } else {
                      try {
                        const response = await api.getSlackAuthUrl();
                        window.location.href = response.authUrl;
                      } catch (err) {
                        console.error('Failed to get Slack auth URL', err);
                        alert('Failed to start Slack connection');
                      }
                    }
                  }}
                  className={`font-label-mono text-label-mono px-6 py-2 w-full uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all ${isConnected('slack') ? 'bg-surface text-on-surface' : 'bg-primary text-on-primary'}`}
                >
                  {isConnected('slack') ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>



            {/* Card 4: Telegram */}
            <div className={`p-6 flex flex-col justify-between min-h-[200px] border-2 border-on-surface ${isConnected('telegram') ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 border-2 border-on-surface flex items-center justify-center ${isConnected('telegram') ? 'bg-surface-variant' : 'bg-surface'}`}>
                  <span className="material-symbols-outlined text-on-surface">chat</span>
                </div>
                {isConnected('telegram') ? (
                  <span className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">CONNECTED</span>
                ) : (
                  <span className="bg-transparent text-outline border-2 border-outline font-label-mono text-label-mono-sm px-3 py-1 rounded-full font-bold">NOT CONNECTED</span>
                )}
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] text-on-surface mb-1 font-bold">Telegram</h3>
                <p className="font-label-mono text-label-mono-sm text-on-surface-variant mb-6 uppercase">Urgent cross-platform nudges</p>
                <button 
                  onClick={() => {
                    const isConn = isConnected('telegram');
                    if (!isConn) {
                      const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'NiyroAppBot'; // Configure this in .env
                      window.open(`https://t.me/${botUsername}?start=${user?.uid}`, '_blank');
                      // Note: We don't automatically toggleChannel here because the backend will handle the DB update
                      // when the webhook fires. A full app would listen to Firestore for the connection status update.
                      alert("Opening Telegram! Please click 'Start' in the bot to instantly connect your account.");
                    } else {
                      toggleChannel('telegram', false);
                    }
                  }}
                  className={`font-label-mono text-label-mono px-6 py-2 w-full uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all ${isConnected('telegram') ? 'bg-surface text-on-surface' : 'bg-primary text-on-primary'}`}
                >
                  {isConnected('telegram') ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 & 3 Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">
          {/* Section 2: Notification Protocols */}
          <section className="lg:col-span-7">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6 uppercase flex items-center gap-4 font-bold">
              <span className="bg-on-surface text-surface w-8 h-8 inline-flex items-center justify-center font-label-mono text-label-mono-sm">02</span>
              NOTIFICATION PROTOCOLS
            </h2>
            <div className="bg-surface-container-lowest border-2 border-on-surface divide-y-2 divide-on-surface">
              {/* Protocol Item 1 */}
              <div className="p-6 flex justify-between items-center hover:bg-surface-container-high transition-colors">
                <div className="pr-6">
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-2 font-bold">Risk Alerts</h4>
                  <p className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Immediate push notification when a deadline probability drops below 70%.</p>
                </div>
                <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                  <input 
                    type="checkbox" 
                    id="toggle1" 
                    checked={riskAlerts} 
                    onChange={(e) => handleTogglePref('riskAlerts', e.target.checked)}
                    className="peer absolute block w-6 h-6 rounded-full bg-surface border-2 border-on-surface appearance-none cursor-pointer z-10 top-1 left-1 checked:right-0 checked:translate-x-6 transition-transform" 
                  />
                  <label htmlFor="toggle1" className="block overflow-hidden h-8 rounded-full border-2 border-on-surface cursor-pointer bg-surface-variant peer-checked:bg-primary transition-colors"></label>
                </div>
              </div>

              {/* Protocol Item 2 */}
              <div className="p-6 flex justify-between items-center hover:bg-surface-container-high transition-colors">
                <div className="pr-6">
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-2 font-bold">Daily Briefing</h4>
                  <p className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Automated summary of critical tasks delivered at 08:00 AM local time.</p>
                </div>
                <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                  <input 
                    type="checkbox" 
                    id="toggle2" 
                    checked={dailyBriefing} 
                    onChange={(e) => handleTogglePref('dailyBriefing', e.target.checked)}
                    className="peer absolute block w-6 h-6 rounded-full bg-surface border-2 border-on-surface appearance-none cursor-pointer z-10 top-1 left-1 checked:right-0 checked:translate-x-6 transition-transform" 
                  />
                  <label htmlFor="toggle2" className="block overflow-hidden h-8 rounded-full border-2 border-on-surface cursor-pointer bg-surface-variant peer-checked:bg-primary transition-colors"></label>
                </div>
              </div>

              {/* Protocol Item 3 */}
              <div className="p-6 flex justify-between items-center hover:bg-surface-container-high transition-colors">
                <div className="pr-6">
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-2 font-bold">Autonomous Actions</h4>
                  <p className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Allow AI to auto-decline meetings when deep work blocks are necessary.</p>
                </div>
                <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                  <input 
                    type="checkbox" 
                    id="toggle3" 
                    checked={autonomousActions} 
                    onChange={(e) => handleTogglePref('autonomousActions', e.target.checked)}
                    className="peer absolute block w-6 h-6 rounded-full bg-surface border-2 border-on-surface appearance-none cursor-pointer z-10 top-1 left-1 checked:right-0 checked:translate-x-6 transition-transform" 
                  />
                  <label htmlFor="toggle3" className="block overflow-hidden h-8 rounded-full border-2 border-on-surface cursor-pointer bg-surface-variant peer-checked:bg-primary transition-colors"></label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Account */}
          <section className="lg:col-span-5 relative mt-12 lg:mt-0">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6 uppercase flex items-center gap-4 font-bold">
              <span className="bg-on-surface text-surface w-8 h-8 inline-flex items-center justify-center font-label-mono text-label-mono-sm">03</span>
              ACCOUNT
            </h2>
            <div className="bg-surface-container-lowest border-2 border-on-surface p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-24 h-24 rounded-full border-2 border-on-surface bg-surface-variant mb-4 overflow-hidden shadow-[4px_4px_0px_#0A0A0A]">
                {user?.photoURL ? (
                  <img alt="User Profile" className="w-full h-full object-cover" src={user.photoURL} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl bg-primary text-on-primary">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              {isEditingProfile ? (
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="font-headline-md text-headline-md text-on-surface mb-1 font-bold bg-surface-variant border-2 border-on-surface px-2 py-1 outline-none focus:border-primary text-center max-w-[200px]"
                  autoFocus
                />
              ) : (
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1 font-bold">{user?.displayName || 'User'}</h3>
              )}
              <p className="font-label-mono text-label-mono-sm text-on-surface-variant mb-6 font-bold">PRO PLAN ACTIVE</p>
              
              <div className="w-full space-y-4 mb-6">
                <div className="flex justify-between items-center border-b-2 border-on-surface border-dotted pb-2">
                  <span className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Email</span>
                  <span className="font-label-mono text-label-mono text-on-surface font-bold">{user?.email || 'N/A'}</span>
                </div>
                
                <div className="flex flex-col border-b-2 border-on-surface border-dotted pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Work Hours & Timezone</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 w-full">
                    <input 
                      type="time" 
                      value={workHoursStart} 
                      onChange={e => setWorkHoursStart(e.target.value)}
                      className="bg-surface-variant border-2 border-on-surface px-2 py-1 font-label-mono text-sm outline-none focus:border-primary flex-1"
                    />
                    <span className="font-bold font-label-mono text-sm text-on-surface-variant">TO</span>
                    <input 
                      type="time" 
                      value={workHoursEnd} 
                      onChange={e => setWorkHoursEnd(e.target.value)}
                      className="bg-surface-variant border-2 border-on-surface px-2 py-1 font-label-mono text-sm outline-none focus:border-primary flex-1"
                    />
                  </div>
                  <input
                    type="text"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    placeholder="e.g. Asia/Kolkata"
                    className="bg-surface-variant border-2 border-on-surface px-2 py-1 font-label-mono text-sm w-full outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex flex-col border-b-2 border-on-surface border-dotted pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase">Focus Session Duration (mins)</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={focusDuration}
                    onChange={e => setFocusDuration(Number(e.target.value))}
                    className="bg-surface-variant border-2 border-on-surface px-2 py-1 font-label-mono text-sm w-full outline-none focus:border-primary mb-4"
                  />
                  <button 
                    onClick={handleSaveWorkHours}
                    disabled={isSavingHours}
                    className="bg-on-surface text-surface font-label-mono text-sm px-4 py-2 uppercase font-bold border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all w-full"
                  >
                    {isSavingHours ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
              
              {isEditingProfile ? (
                <button 
                  onClick={handleSaveProfile}
                  className="bg-primary text-on-primary font-label-mono text-label-mono px-6 py-2 w-full uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all mb-4"
                >
                  Save Profile
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-surface text-on-surface font-label-mono text-label-mono px-6 py-2 w-full uppercase font-bold border-2 border-on-surface rounded-full shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all mb-4"
                >
                  Edit Profile
                </button>
              )}
              
              <button 
                onClick={handleSignOut}
                className="text-error font-label-mono text-label-mono-sm uppercase hover:underline decoration-2 underline-offset-4 font-bold cursor-pointer bg-transparent border-none"
              >
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </main>
      </div>
    </div>
  );
};
