// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Share2, Clock, Music, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { adminAuth as auth } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { adminDb as db } from "@/lib/firebase/config";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import SocialLinks from "@/components/admin/settings/SocialLinks";
import ContactSettings from "@/components/admin/settings/ContactSettings";
import TimingsSettings from "@/components/admin/settings/TimingsSettings";
import SongManagement from "@/components/admin/settings/SongManagement";
import HeroImagesSettings from "@/components/admin/settings/HeroImagesSettings";

import { 
  getSettings, 
  updateSocialLinks, 
  updateContactSettings,
  updateTimingsSettings,
  updateSongSettings
} from "@/lib/services/settingsService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";

const tabs = [
  { id: "social", name: "Social Links", icon: Share2 },
  { id: "contact", name: "Contact", icon: Phone },
  { id: "timings", name: "Darshan Timings", icon: Clock },
  { id: "hero", name: "Hero Images", icon: ImageIcon },
  { id: "song", name: "Song Management", icon: Music },
];

export default function SettingsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();
  const [activeTab, setActiveTab] = useState("social");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/admin/login');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        router.push('/admin/login');
        return;
      }

      const data = userDoc.data();
      setUserRole(data.role || '');
      
      if (data.role === 'super_admin' || data.role === 'admin') {
        setIsAdmin(true);
        fetchSettings();
      } else {
        toast.error("You don't have permission to access this page");
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/admin/login');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getSettings();
      if (result.success) {
        setSettings(result.settings);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSocial = async (data: any) => {
    const result = await updateSocialLinks(data);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'social',
        entityTitle: 'Social Links',
        details: 'Updated social media links',
      });
      toast.success("Social links updated successfully");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update settings");
    }
  };

  const handleUpdateContact = async (data: any) => {
    const result = await updateContactSettings(data);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'contact',
        entityTitle: 'Contact Settings',
        details: 'Updated contact information',
      });
      toast.success("Contact information updated successfully");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update contact info");
    }
  };

  const handleUpdateTimings = async (data: any) => {
    const result = await updateTimingsSettings(data);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'timings',
        entityTitle: 'Darshan Timings',
        details: 'Updated darshan timings and rituals',
      });
      toast.success("Timings updated successfully");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update timings");
    }
  };

  const handleUpdateSong = async (data: any) => {
    const result = await updateSongSettings(data);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'song',
        entityTitle: 'Song Management',
        details: 'Updated homepage song playback settings',
      });
      toast.success("Song settings updated successfully");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update song settings");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">Access Denied</h2>
          <p className="text-[#555555] mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border-2 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
            <span className="text-[#D4AF37]">Settings</span>
          </h1>
          <p className="text-sm text-[#555555] mt-1">Manage your website configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#E5E3DD]/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-[#555555] hover:text-[#0B3C5D]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "social" && settings?.social && (
          <SocialLinks
            settings={settings.social}
            onUpdate={handleUpdateSocial}
          />
        )}

        {activeTab === "contact" && settings?.contact && (
          <ContactSettings
            settings={settings.contact}
            onUpdate={handleUpdateContact}
          />
        )}

        {activeTab === "timings" && settings?.timings && (
          <TimingsSettings
            settings={settings.timings}
            onUpdate={handleUpdateTimings}
          />
        )}

        {activeTab === "hero" && (
        <HeroImagesSettings />
         )}

        {activeTab === "song" && (
          <SongManagement
            settings={settings?.song || { enabled: true, autoplay: true, loop: true }}
            onUpdate={handleUpdateSong}
          />
        )}
      </div>
    </div>
  );
}
