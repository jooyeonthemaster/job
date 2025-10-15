/**
 * Firebase → Supabase 데이터 마이그레이션 스크립트
 * 
 * 실행 방법:
 * 1. .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY 추가
 * 2. npx ts-node scripts/migrate-firebase-to-supabase.ts
 * 
 * 주의사항:
 * - 이 스크립트는 한 번만 실행해야 합니다
 * - 실행 전 Supabase에서 schema.sql을 먼저 실행하세요
 * - Service Role Key는 절대 클라이언트에 노출하지 마세요
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

// Firebase 초기화
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// Supabase 초기화 (Service Role Key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
  console.log('Supabase Dashboard > Settings > API에서 Service Role Key를 복사하여');
  console.log('.env.local 파일에 SUPABASE_SERVICE_ROLE_KEY="..."로 추가하세요');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 마이그레이션 통계
interface MigrationStats {
  users: { total: number; success: number; failed: number };
  companies: { total: number; success: number; failed: number };
  jobs: { total: number; success: number; failed: number };
  talentApplications: { total: number; success: number; failed: number };
  jobApplications: { total: number; success: number; failed: number };
}

const stats: MigrationStats = {
  users: { total: 0, success: 0, failed: 0 },
  companies: { total: 0, success: 0, failed: 0 },
  jobs: { total: 0, success: 0, failed: 0 },
  talentApplications: { total: 0, success: 0, failed: 0 },
  jobApplications: { total: 0, success: 0, failed: 0 }
};

/**
 * 1. Users (구직자) 마이그레이션
 */
async function migrateUsers() {
  console.log('\n🔄 Users 마이그레이션 시작...');
  
  try {
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    stats.users.total = usersSnapshot.size;
    console.log(`📊 총 ${stats.users.total}명의 사용자 발견`);

    for (const doc of usersSnapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        // 1. users 테이블에 기본 정보 저장
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            firebase_uid: doc.id,
            email: firebaseData.email,
            user_type: firebaseData.userType || 'jobseeker',
            full_name: firebaseData.fullName || '',
            headline: firebaseData.headline,
            profile_image_url: firebaseData.profileImageUrl,
            work_type: firebaseData.workType,
            company_size: firebaseData.companySize,
            visa_sponsorship: firebaseData.visaSponsorship || false,
            remote_work: firebaseData.remoteWork,
            introduction: firebaseData.introduction,
            resume_file_url: firebaseData.resumeFileUrl,
            resume_file_name: firebaseData.resumeFileName,
            resume_uploaded_at: firebaseData.resumeUploadedAt,
            onboarding_completed: firebaseData.onboardingCompleted || false,
            created_at: firebaseData.createdAt?.toDate?.() || new Date(),
            updated_at: firebaseData.updatedAt?.toDate?.() || new Date(),
            applications_count: firebaseData.applicationsCount || 0,
            profile_views: firebaseData.profileViews || 0,
            messages_count: firebaseData.messagesCount || 0
          })
          .select()
          .single();

        if (userError) throw userError;

        // 2. skills 테이블에 저장
        if (firebaseData.skills && Array.isArray(firebaseData.skills)) {
          const skillsData = firebaseData.skills.map((skill: string) => ({
            user_id: user.id,
            skill_name: skill
          }));
          
          if (skillsData.length > 0) {
            await supabase.from('user_skills').insert(skillsData);
          }
        }

        // 3. languages 테이블에 저장
        if (firebaseData.languages && Array.isArray(firebaseData.languages)) {
          const languagesData = firebaseData.languages.map((lang: string) => ({
            user_id: user.id,
            language_name: lang,
            proficiency: 'INTERMEDIATE' // 기본값
          }));
          
          if (languagesData.length > 0) {
            await supabase.from('user_languages').insert(languagesData);
          }
        }

        // 4. experiences 테이블에 저장
        if (firebaseData.experiences && Array.isArray(firebaseData.experiences)) {
          const experiencesData = firebaseData.experiences.map((exp: any) => ({
            user_id: user.id,
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            is_current: exp.current || false,
            description: exp.description
          }));
          
          if (experiencesData.length > 0) {
            await supabase.from('user_experiences').insert(experiencesData);
          }
        }

        // 5. educations 테이블에 저장
        if (firebaseData.educations && Array.isArray(firebaseData.educations)) {
          const educationsData = firebaseData.educations.map((edu: any) => ({
            user_id: user.id,
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            start_year: parseInt(edu.startYear),
            end_year: edu.endYear ? parseInt(edu.endYear) : null,
            is_current: edu.current || false
          }));
          
          if (educationsData.length > 0) {
            await supabase.from('user_educations').insert(educationsData);
          }
        }

        // 6. desired positions 저장
        if (firebaseData.desiredPositions && Array.isArray(firebaseData.desiredPositions)) {
          const positionsData = firebaseData.desiredPositions.map((pos: string) => ({
            user_id: user.id,
            position_name: pos
          }));
          
          if (positionsData.length > 0) {
            await supabase.from('user_desired_positions').insert(positionsData);
          }
        }

        // 7. preferred locations 저장
        if (firebaseData.preferredLocations && Array.isArray(firebaseData.preferredLocations)) {
          const locationsData = firebaseData.preferredLocations.map((loc: string) => ({
            user_id: user.id,
            location_name: loc
          }));
          
          if (locationsData.length > 0) {
            await supabase.from('user_preferred_locations').insert(locationsData);
          }
        }

        // 8. salary range 저장
        if (firebaseData.salaryRange) {
          await supabase.from('user_salary_range').insert({
            user_id: user.id,
            min_salary: firebaseData.salaryRange.min,
            max_salary: firebaseData.salaryRange.max,
            currency: 'KRW'
          });
        }

        stats.users.success++;
        console.log(`✅ User ${stats.users.success}/${stats.users.total}: ${firebaseData.fullName || firebaseData.email}`);
      } catch (error) {
        stats.users.failed++;
        console.error(`❌ User 마이그레이션 실패 (${doc.id}):`, error);
      }
    }

    console.log(`\n✅ Users 마이그레이션 완료: ${stats.users.success}/${stats.users.total} 성공`);
  } catch (error) {
    console.error('❌ Users 마이그레이션 중 오류:', error);
    throw error;
  }
}

/**
 * 2. Companies (기업) 마이그레이션
 */
async function migrateCompanies() {
  console.log('\n🔄 Companies 마이그레이션 시작...');
  
  try {
    const companiesSnapshot = await getDocs(collection(firestore, 'companies'));
    stats.companies.total = companiesSnapshot.size;
    console.log(`📊 총 ${stats.companies.total}개의 기업 발견`);

    for (const doc of companiesSnapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        // 1. companies 테이블에 기본 정보 저장
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            firebase_uid: doc.id,
            email: firebaseData.email,
            name: firebaseData.name,
            name_en: firebaseData.nameEn,
            registration_number: firebaseData.registrationNumber,
            ceo_name: firebaseData.ceoName,
            established: firebaseData.established,
            industry: firebaseData.industry,
            employee_count: firebaseData.employeeCount,
            phone: firebaseData.phone,
            website: firebaseData.website,
            location: firebaseData.location,
            address: firebaseData.address,
            logo: firebaseData.logo,
            banner_image: firebaseData.bannerImage,
            description: firebaseData.description || '',
            slogan: firebaseData.slogan,
            vision: firebaseData.vision,
            mission: firebaseData.mission,
            revenue: firebaseData.revenue,
            funding: firebaseData.funding,
            created_at: firebaseData.createdAt?.toDate?.() || new Date(),
            updated_at: firebaseData.updatedAt?.toDate?.() || new Date(),
            status: firebaseData.status || 'pending',
            profile_completed: firebaseData.profileCompleted || false,
            rating: firebaseData.rating || 0,
            review_count: firebaseData.reviewCount || 0
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // 2. tech stack 저장
        if (firebaseData.techStack && Array.isArray(firebaseData.techStack)) {
          const techStackData = firebaseData.techStack.map((tech: string) => ({
            company_id: company.id,
            tech_name: tech
          }));
          
          if (techStackData.length > 0) {
            await supabase.from('company_tech_stack').insert(techStackData);
          }
        }

        // 3. benefits 저장 (객체 구조)
        if (firebaseData.benefits && typeof firebaseData.benefits === 'object') {
          const benefitsData: any[] = [];
          
          Object.entries(firebaseData.benefits).forEach(([category, items]: [string, any]) => {
            if (Array.isArray(items)) {
              items.forEach((item: any) => {
                benefitsData.push({
                  company_id: company.id,
                  category: category,
                  title: item.title || item,
                  description: item.description || '',
                  icon: item.icon || ''
                });
              });
            }
          });
          
          if (benefitsData.length > 0) {
            await supabase.from('company_benefits').insert(benefitsData);
          }
        }

        // 4. stats 저장
        if (firebaseData.stats) {
          await supabase.from('company_stats').insert({
            company_id: company.id,
            current_employees: firebaseData.stats.currentEmployees,
            last_year_employees: firebaseData.stats.lastYearEmployees,
            avg_salary: firebaseData.stats.avgSalary,
            avg_tenure: firebaseData.stats.avgTenure,
            female_ratio: firebaseData.stats.femaleRatio,
            foreigner_ratio: firebaseData.stats.foreignerRatio,
            growth_rate: firebaseData.stats.growthRate,
            turnover_rate: firebaseData.stats.turnoverRate,
            recommend_rate: firebaseData.stats.recommendRate,
            interview_difficulty: firebaseData.stats.interviewDifficulty
          });
        }

        // 5. recruiters 저장
        if (firebaseData.recruiters && Array.isArray(firebaseData.recruiters)) {
          const recruitersData = firebaseData.recruiters.map((recruiter: any) => ({
            company_id: company.id,
            name: recruiter.name,
            position: recruiter.position,
            email: recruiter.email,
            phone: recruiter.phone,
            profile_image: recruiter.profileImage,
            is_primary: recruiter.isPrimary || false
          }));
          
          if (recruitersData.length > 0) {
            await supabase.from('company_recruiters').insert(recruitersData);
          }
        }

        // 6. offices 저장
        if (firebaseData.offices && Array.isArray(firebaseData.offices)) {
          const officesData = firebaseData.offices.map((office: any) => ({
            company_id: company.id,
            name: office.name,
            name_en: office.nameEn,
            address: office.address,
            address_en: office.addressEn,
            detail_address: office.detailAddress,
            postal_code: office.postalCode,
            office_type: office.type,
            employees: office.employees,
            latitude: office.lat,
            longitude: office.lng,
            map_url: office.mapUrl,
            is_main: office.isMain || false
          }));
          
          if (officesData.length > 0) {
            await supabase.from('company_offices').insert(officesData);
          }
        }

        stats.companies.success++;
        console.log(`✅ Company ${stats.companies.success}/${stats.companies.total}: ${firebaseData.name}`);
      } catch (error) {
        stats.companies.failed++;
        console.error(`❌ Company 마이그레이션 실패 (${doc.id}):`, error);
      }
    }

    console.log(`\n✅ Companies 마이그레이션 완료: ${stats.companies.success}/${stats.companies.total} 성공`);
  } catch (error) {
    console.error('❌ Companies 마이그레이션 중 오류:', error);
    throw error;
  }
}

/**
 * 3. Jobs (채용공고) 마이그레이션
 */
async function migrateJobs() {
  console.log('\n🔄 Jobs 마이그레이션 시작...');
  
  try {
    const jobsSnapshot = await getDocs(collection(firestore, 'jobs'));
    stats.jobs.total = jobsSnapshot.size;
    console.log(`📊 총 ${stats.jobs.total}개의 채용공고 발견`);

    // company_id 매핑 (firebase_uid → supabase id)
    const { data: companies } = await supabase
      .from('companies')
      .select('id, firebase_uid');
    
    const companyIdMap = new Map(
      companies?.map((c: any) => [c.firebase_uid, c.id]) || []
    );

    for (const doc of jobsSnapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        // companyId 매핑
        const supabaseCompanyId = companyIdMap.get(firebaseData.companyId);
        if (!supabaseCompanyId) {
          console.warn(`⚠️ Company ID ${firebaseData.companyId}에 해당하는 Supabase 기업을 찾을 수 없습니다`);
          stats.jobs.failed++;
          continue;
        }

        // 1. jobs 테이블에 기본 정보 저장
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .insert({
            company_id: supabaseCompanyId,
            title: firebaseData.title,
            title_en: firebaseData.titleEn,
            department: firebaseData.department,
            location: firebaseData.location,
            employment_type: firebaseData.employmentType,
            experience_level: firebaseData.experienceLevel,
            salary_min: firebaseData.salary?.min,
            salary_max: firebaseData.salary?.max,
            salary_currency: firebaseData.salary?.currency || 'KRW',
            salary_negotiable: firebaseData.salary?.negotiable || false,
            description: firebaseData.description,
            visa_sponsorship: firebaseData.visaSponsorship || false,
            korean_level: firebaseData.languageRequirements?.korean,
            english_level: firebaseData.languageRequirements?.english,
            posting_tier: firebaseData.posting?.tier || 'standard',
            posting_price: firebaseData.posting?.price || 100000,
            posting_duration: firebaseData.posting?.duration || 30,
            posting_vat_amount: firebaseData.posting?.vatAmount || 10000,
            posting_total_amount: firebaseData.posting?.totalAmount || 110000,
            payment_status: firebaseData.payment?.status || 'pending',
            payment_requested_at: firebaseData.payment?.requestedAt?.toDate?.() || new Date(),
            payment_paid_at: firebaseData.payment?.paidAt?.toDate?.(),
            payment_confirmed_at: firebaseData.payment?.confirmedAt?.toDate?.(),
            payment_billing_contact_name: firebaseData.payment?.billingContact?.name,
            payment_billing_contact_phone: firebaseData.payment?.billingContact?.phone,
            display_position: firebaseData.display?.position,
            display_priority: firebaseData.display?.priority,
            display_assigned_at: firebaseData.display?.assignedAt?.toDate?.(),
            display_assigned_by: firebaseData.display?.assignedBy,
            deadline: firebaseData.deadline,
            posted_at: firebaseData.postedAt?.toDate?.() || new Date(),
            views: firebaseData.views || 0,
            applicants: firebaseData.applicants || 0,
            status: firebaseData.status || 'pending_payment',
            created_at: firebaseData.createdAt?.toDate?.() || new Date(),
            updated_at: firebaseData.updatedAt?.toDate?.() || new Date()
          })
          .select()
          .single();

        if (jobError) throw jobError;

        // 2. main tasks 저장
        if (firebaseData.mainTasks && Array.isArray(firebaseData.mainTasks)) {
          const tasksData = firebaseData.mainTasks.map((task: string, index: number) => ({
            job_id: job.id,
            task_text: task,
            sort_order: index
          }));
          
          if (tasksData.length > 0) {
            await supabase.from('job_main_tasks').insert(tasksData);
          }
        }

        // 3. requirements 저장
        if (firebaseData.requirements && Array.isArray(firebaseData.requirements)) {
          const reqData = firebaseData.requirements.map((req: string, index: number) => ({
            job_id: job.id,
            requirement_text: req,
            is_preferred: false,
            sort_order: index
          }));
          
          if (reqData.length > 0) {
            await supabase.from('job_requirements').insert(reqData);
          }
        }

        // 4. preferred qualifications 저장
        if (firebaseData.preferredQualifications && Array.isArray(firebaseData.preferredQualifications)) {
          const prefData = firebaseData.preferredQualifications.map((pref: string, index: number) => ({
            job_id: job.id,
            requirement_text: pref,
            is_preferred: true,
            sort_order: index + 1000 // requirements 뒤에 오도록
          }));
          
          if (prefData.length > 0) {
            await supabase.from('job_requirements').insert(prefData);
          }
        }

        // 5. benefits 저장
        if (firebaseData.benefits && Array.isArray(firebaseData.benefits)) {
          const benefitsData = firebaseData.benefits.map((benefit: string, index: number) => ({
            job_id: job.id,
            benefit_text: benefit,
            sort_order: index
          }));
          
          if (benefitsData.length > 0) {
            await supabase.from('job_benefits').insert(benefitsData);
          }
        }

        // 6. tags 저장
        if (firebaseData.tags && Array.isArray(firebaseData.tags)) {
          const tagsData = firebaseData.tags.map((tag: string) => ({
            job_id: job.id,
            tag_name: tag
          }));
          
          if (tagsData.length > 0) {
            await supabase.from('job_tags').insert(tagsData);
          }
        }

        // 7. manager 저장
        if (firebaseData.manager) {
          await supabase.from('job_manager').insert({
            job_id: job.id,
            name: firebaseData.manager.name,
            position: firebaseData.manager.position,
            email: firebaseData.manager.email,
            phone: firebaseData.manager.phone
          });
        }

        // 8. work conditions 저장
        if (firebaseData.workConditions) {
          await supabase.from('job_work_conditions').insert({
            job_id: job.id,
            probation: firebaseData.workConditions.probation,
            work_hours: firebaseData.workConditions.workHours,
            start_date: firebaseData.workConditions.startDate
          });
        }

        stats.jobs.success++;
        console.log(`✅ Job ${stats.jobs.success}/${stats.jobs.total}: ${firebaseData.title}`);
      } catch (error) {
        stats.jobs.failed++;
        console.error(`❌ Job 마이그레이션 실패 (${doc.id}):`, error);
      }
    }

    console.log(`\n✅ Jobs 마이그레이션 완료: ${stats.jobs.success}/${stats.jobs.total} 성공`);
  } catch (error) {
    console.error('❌ Jobs 마이그레이션 중 오류:', error);
    throw error;
  }
}

/**
 * 4. Talent Applications 마이그레이션
 */
async function migrateTalentApplications() {
  console.log('\n🔄 Talent Applications 마이그레이션 시작...');
  
  try {
    const applicationsSnapshot = await getDocs(collection(firestore, 'talent_applications'));
    stats.talentApplications.total = applicationsSnapshot.size;
    console.log(`📊 총 ${stats.talentApplications.total}개의 인재 채용 신청 발견`);

    // user_id 매핑
    const { data: users } = await supabase
      .from('users')
      .select('id, firebase_uid');
    
    const userIdMap = new Map(
      users?.map((u: any) => [u.firebase_uid, u.id]) || []
    );

    for (const doc of applicationsSnapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        const supabaseTalentId = userIdMap.get(firebaseData.talentId);
        if (!supabaseTalentId) {
          console.warn(`⚠️ Talent ID ${firebaseData.talentId}에 해당하는 사용자를 찾을 수 없습니다`);
          stats.talentApplications.failed++;
          continue;
        }

        await supabase
          .from('talent_applications')
          .insert({
            talent_id: supabaseTalentId,
            talent_name: firebaseData.talentName,
            company_name: firebaseData.companyName,
            position: firebaseData.position,
            message: firebaseData.message,
            contact_email: firebaseData.contactEmail,
            status: firebaseData.status || 'pending',
            notes: firebaseData.notes,
            created_at: firebaseData.createdAt?.toDate?.() || new Date(),
            updated_at: firebaseData.updatedAt?.toDate?.() || new Date()
          });

        stats.talentApplications.success++;
      } catch (error) {
        stats.talentApplications.failed++;
        console.error(`❌ Talent Application 마이그레이션 실패 (${doc.id}):`, error);
      }
    }

    console.log(`\n✅ Talent Applications 마이그레이션 완료: ${stats.talentApplications.success}/${stats.talentApplications.total} 성공`);
  } catch (error) {
    console.error('❌ Talent Applications 마이그레이션 중 오류:', error);
    throw error;
  }
}

/**
 * 5. Job Applications 마이그레이션
 */
async function migrateJobApplications() {
  console.log('\n🔄 Job Applications 마이그레이션 시작...');
  
  try {
    const applicationsSnapshot = await getDocs(collection(firestore, 'job_applications'));
    stats.jobApplications.total = applicationsSnapshot.size;
    console.log(`📊 총 ${stats.jobApplications.total}개의 채용공고 지원 발견`);

    // ID 매핑
    const { data: jobs } = await supabase.from('jobs').select('id');
    const { data: companies } = await supabase.from('companies').select('id, firebase_uid');
    const { data: users } = await supabase.from('users').select('id, firebase_uid');
    
    const companyIdMap = new Map(companies?.map((c: any) => [c.firebase_uid, c.id]) || []);
    const userIdMap = new Map(users?.map((u: any) => [u.firebase_uid, u.id]) || []);

    for (const doc of applicationsSnapshot.docs) {
      try {
        const firebaseData = doc.data();
        
        // ID 매핑 (job_id는 직접 매핑 불가능하므로 스킵하거나 추가 로직 필요)
        const supabaseCompanyId = companyIdMap.get(firebaseData.companyId);
        const supabaseApplicantId = userIdMap.get(firebaseData.applicantId);

        if (!supabaseCompanyId || !supabaseApplicantId) {
          stats.jobApplications.failed++;
          continue;
        }

        await supabase
          .from('job_applications')
          .insert({
            job_id: null, // TODO: job_id 매핑 필요
            job_title: firebaseData.jobTitle,
            company_id: supabaseCompanyId,
            company_name: firebaseData.companyName,
            applicant_id: supabaseApplicantId,
            applicant_name: firebaseData.applicantName,
            applicant_email: firebaseData.applicantEmail,
            message: firebaseData.message,
            status: firebaseData.status || 'pending',
            manager_name: firebaseData.managerName,
            manager_email: firebaseData.managerEmail,
            manager_phone: firebaseData.managerPhone,
            notes: firebaseData.notes,
            created_at: firebaseData.createdAt?.toDate?.() || new Date(),
            updated_at: firebaseData.updatedAt?.toDate?.() || new Date()
          });

        stats.jobApplications.success++;
      } catch (error) {
        stats.jobApplications.failed++;
        console.error(`❌ Job Application 마이그레이션 실패 (${doc.id}):`, error);
      }
    }

    console.log(`\n✅ Job Applications 마이그레이션 완료: ${stats.jobApplications.success}/${stats.jobApplications.total} 성공`);
  } catch (error) {
    console.error('❌ Job Applications 마이그레이션 중 오류:', error);
    throw error;
  }
}

/**
 * 메인 마이그레이션 함수
 */
async function main() {
  console.log('🚀 Firebase → Supabase 데이터 마이그레이션 시작\n');
  console.log('⚠️  주의: 이 작업은 되돌릴 수 없습니다!');
  console.log('⚠️  Supabase에서 schema.sql을 먼저 실행했는지 확인하세요!\n');

  const startTime = Date.now();

  try {
    // 순서대로 마이그레이션 실행
    await migrateUsers();
    await migrateCompanies();
    await migrateJobs();
    await migrateTalentApplications();
    await migrateJobApplications();

    // 최종 통계
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 마이그레이션 완료!');
    console.log('='.repeat(60));
    console.log(`\n소요 시간: ${duration}초\n`);
    console.log('📊 마이그레이션 통계:');
    console.log(`  Users:              ${stats.users.success}/${stats.users.total} (실패: ${stats.users.failed})`);
    console.log(`  Companies:          ${stats.companies.success}/${stats.companies.total} (실패: ${stats.companies.failed})`);
    console.log(`  Jobs:               ${stats.jobs.success}/${stats.jobs.total} (실패: ${stats.jobs.failed})`);
    console.log(`  Talent Apps:        ${stats.talentApplications.success}/${stats.talentApplications.total} (실패: ${stats.talentApplications.failed})`);
    console.log(`  Job Apps:           ${stats.jobApplications.success}/${stats.jobApplications.total} (실패: ${stats.jobApplications.failed})`);
    
    const totalSuccess = stats.users.success + stats.companies.success + stats.jobs.success + stats.talentApplications.success + stats.jobApplications.success;
    const totalRecords = stats.users.total + stats.companies.total + stats.jobs.total + stats.talentApplications.total + stats.jobApplications.total;
    
    console.log(`\n  전체:               ${totalSuccess}/${totalRecords}`);
    console.log('\n✅ 다음 단계:');
    console.log('  1. Supabase Dashboard에서 데이터 확인');
    console.log('  2. 서비스 레이어 코드 변환 (lib/supabase/*.ts)');
    console.log('  3. 테스트 실행');
    console.log('  4. Firebase 연결 제거\n');
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 실행
main();

