'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';
import { getProfileChecklist, calculateChecklistPercentage } from '@/lib/utils/profile-checklist';
import Header from '@/components/Header';
import HeroSection from '@/components/jobseeker-dashboard/HeroSection';
import ProfileChecklist from '@/components/jobseeker-dashboard/ProfileChecklist';
import ProfileCompleteBanner from '@/components/jobseeker-dashboard/ProfileCompleteBanner';
import ProfileViewsNotification from '@/components/jobseeker-dashboard/ProfileViewsNotification';
import ContactAccessRequests from '@/components/jobseeker-dashboard/ContactAccessRequests';
import ApplicationStatus from '@/components/jobseeker-dashboard/ApplicationStatus';
import ExperienceSection from '@/components/jobseeker-dashboard/ExperienceSection';
import EducationSection from '@/components/jobseeker-dashboard/EducationSection';
import RecommendedJobs from '@/components/jobseeker-dashboard/RecommendedJobs';
import QuickActions from '@/components/jobseeker-dashboard/QuickActions';
import SkillsLanguages from '@/components/jobseeker-dashboard/SkillsLanguages';
import PreferencesCard from '@/components/jobseeker-dashboard/PreferencesCard';
import ResumeCard from '@/components/jobseeker-dashboard/ResumeCard';
import IntroductionCard from '@/components/jobseeker-dashboard/IntroductionCard';
import CareerTip from '@/components/jobseeker-dashboard/CareerTip';
import AccountSettings from '@/components/jobseeker-dashboard/AccountSettings';
import ResumePreviewModal from '@/components/jobseeker-dashboard/ResumePreviewModal';
import DeleteAccountModal from '@/components/jobseeker-dashboard/DeleteAccountModal';

export default function JobSeekerDashboard() {
  const { user, logout } = useAuth();
  const { loading, profileData, recommendedJobs } = useDashboardData(user?.id);
  const { deleteAccount, isDeleting, deleteError } = useAccountDeletion();

  const [showResumePreview, setShowResumePreview] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const checklist = getProfileChecklist(profileData);
  const checklistPercentage = calculateChecklistPercentage(profileData);

  const handleDeleteAccount = () => {
    deleteAccount(user, logout);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <HeroSection profileData={profileData} />

      {/* Main Dashboard */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Complete Banner (100%일 때만) */}
              {checklistPercentage >= 100 && <ProfileCompleteBanner />}

              {/* Profile Completion Checklist (항상 표시) */}
              <ProfileChecklist
                checklist={checklist}
                checklistPercentage={checklistPercentage}
                profileData={profileData}
              />

              {/* Profile Views Notification */}
              <ProfileViewsNotification userId={user?.id} />

              {/* Contact Access Requests */}
              <ContactAccessRequests userId={user?.id} />

              {/* Application Status */}
              <ApplicationStatus />

              {/* Experience Section */}
              {profileData?.experiences && profileData.experiences.length > 0 && (
                <ExperienceSection experiences={profileData.experiences} />
              )}

              {/* Education Section */}
              {profileData?.educations && profileData.educations.length > 0 && (
                <EducationSection educations={profileData.educations} />
              )}

              {/* Recommended Jobs */}
              <RecommendedJobs jobs={recommendedJobs} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Skills & Languages */}
              <SkillsLanguages
                skills={profileData?.skills || []}
                languages={profileData?.languages || []}
              />

              {/* Preferences */}
              <PreferencesCard profileData={profileData} />

              {/* Resume */}
              {profileData?.resumeFileUrl && (
                <ResumeCard
                  resumeFileUrl={profileData.resumeFileUrl}
                  resumeFileName={profileData.resumeFileName}
                  resumeUploadedAt={profileData.resumeUploadedAt}
                  onPreview={() => setShowResumePreview(true)}
                  userId={user?.id}
                />
              )}

              {/* Introduction */}
              {profileData?.introduction && (
                <IntroductionCard introduction={profileData.introduction} />
              )}

              {/* Career Tips */}
              <CareerTip />

              {/* Account Settings */}
              <AccountSettings onDeleteClick={() => setDeleteModalOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      {/* PDF Preview Modal */}
      {profileData?.resumeFileUrl && (
        <ResumePreviewModal
          isOpen={showResumePreview}
          onClose={() => setShowResumePreview(false)}
          resumeFileUrl={profileData.resumeFileUrl}
          resumeFileName={profileData.resumeFileName}
          userId={user?.id}
        />
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />
    </div>
  );
}
