import test from 'node:test';
import assert from 'node:assert/strict';
import {
  discoverSmartOpportunities,
  understandIntelligentAgentRequest,
  FIREWORK_MARKETPLACE_CATALOG,
} from './agentEngine';
import type { SavedProject, UserProfile } from '../types';

const sampleUserProfile: Partial<UserProfile> = {
  uid: 'user-test-1',
  name: 'أحمد مطور',
  title: 'Full-Stack Web & UI Developer',
  professionalHeadline: 'Full-Stack Web & UI Developer',
  professionalLevel: 'Intermediate',
  hourlyRate: 45,
  workStatus: 'work',
  skills: [
    { id: 's1', name: 'React', level: 'خبير', verified: true },
    { id: 's2', name: 'TypeScript', level: 'خبير', verified: true },
    { id: 's3', name: 'UI/UX', level: 'متقدم', verified: true },
  ],
};

const sampleProjects: Array<Partial<SavedProject>> = [
  {
    id: 'proj-store-1',
    title: 'تطوير متجر إلكتروني متجاوب',
    platform: 'Upwork',
    budget: '$1,800',
    status: 'analyzed',
  },
  {
    id: 'proj-logo-2',
    title: 'تصميم شعار وهوية بصرية',
    platform: 'Mostaql',
    budget: '$400',
    status: 'new',
  },
];

test('understands Arabic, dialectal, and English Work/Sleep toggle commands accurately', () => {
  const toSleep = understandIntelligentAgentRequest('بدل وضعي من Work إلى Sleep', {
    userProfile: { ...sampleUserProfile, workStatus: 'work' },
    workStatus: 'work',
  });
  assert.equal(toSleep.actionType, 'set_work_status');
  assert.equal(toSleep.workStatus, 'sleep');

  const stopReceiving = understandIntelligentAgentRequest('وقف استقبالي للأعمال حالياً', {
    userProfile: { ...sampleUserProfile, workStatus: 'work' },
    workStatus: 'work',
  });
  assert.equal(stopReceiving.actionType, 'set_work_status');
  assert.equal(stopReceiving.workStatus, 'sleep');

  const levantineUnavailable = understandIntelligentAgentRequest('ما بدي أكون متاح حالياً', {
    userProfile: { ...sampleUserProfile, workStatus: 'work' },
    workStatus: 'work',
  });
  assert.equal(levantineUnavailable.actionType, 'set_work_status');
  assert.equal(levantineUnavailable.workStatus, 'sleep');

  const dialectToWork = understandIntelligentAgentRequest('خليني متاح للشغل الآن', {
    userProfile: { ...sampleUserProfile, workStatus: 'sleep' },
    workStatus: 'sleep',
  });
  assert.equal(dialectToWork.actionType, 'set_work_status');
  assert.equal(dialectToWork.workStatus, 'work');
});

test('manages profile skills and hourly rate updates with clear structured payloads', () => {
  const addSkill = understandIntelligentAgentRequest('أضف مهارة Figma إلى مهاراتي', {
    userProfile: sampleUserProfile,
  });
  assert.equal(addSkill.actionType, 'manage_skills');
  assert.equal(addSkill.skillMutation?.operation, 'add');
  assert.equal(addSkill.skillMutation?.skillName.toLowerCase(), 'figma');

  const removeSkill = understandIntelligentAgentRequest('احذف مهارة TypeScript من ملفي', {
    userProfile: sampleUserProfile,
  });
  assert.equal(removeSkill.actionType, 'manage_skills');
  assert.equal(removeSkill.skillMutation?.operation, 'remove');

  const updateRate = understandIntelligentAgentRequest('غير سعر ساعتي إلى 85 دولار', {
    userProfile: sampleUserProfile,
  });
  assert.equal(updateRate.actionType, 'update_profile');
  assert.equal(updateRate.profileUpdates?.hourlyRate, 85);
});

test('enforces confirmation gate on destructive delete_project commands', () => {
  const delReq = understandIntelligentAgentRequest('احذف مشروع متجر إلكتروني', {
    userProfile: sampleUserProfile,
    projects: sampleProjects,
  });
  assert.equal(delReq.actionType, 'delete_project');
  assert.equal(delReq.requiresConfirmation, true);
  assert.equal(delReq.confirmed, false);
  assert.equal(delReq.projectDeleteTarget?.projectId, 'proj-store-1');
});

test('Smart Job Discovery filters strictly from real Firework catalog without fabricating projects', () => {
  const beginnerDesign = discoverSmartOpportunities(
    'ابحث عن أعمال مناسبة للمبتدئين في التصميم',
    sampleUserProfile
  );
  assert.ok(beginnerDesign.opportunities.length >= 1);
  for (const opp of beginnerDesign.opportunities) {
    assert.equal(opp.category, 'design_ui');
    assert.equal(opp.experienceLevel, 'beginner');
    assert.ok(Array.isArray(opp.matchReasons) && opp.matchReasons.length > 0);
  }

  // Impossible budget constraint must return 0 matches honestly rather than inventing fake jobs
  const impossibleBudget = discoverSmartOpportunities(
    'مشاريع برمجة بميزانية فوق 999999 دولار',
    sampleUserProfile
  );
  assert.equal(impossibleBudget.opportunities.length, 0);
  assert.match(impossibleBudget.summaryAr, /اختلاق/);

  // Real catalog must contain beginner, intermediate, expert & writing/design/software entries
  assert.ok(FIREWORK_MARKETPLACE_CATALOG.length >= 12);
});
