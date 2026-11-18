import React, { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  ScanSearch,
  FilePenLine,
  MessageSquareCode,
  Mic,
  Kanban,
  Compass,
  FileSpreadsheet,
  FileUser,
  FileImage,
  Briefcase,
  Calculator,
  Wallet,
  BarChart3,
  Link2,
  UserCheck,
  Bell,
  Settings,
  Search,
  Sparkles,
  CheckCircle2,
  ArrowUpLeft,
  ShieldCheck,
  HelpCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { ViewId } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserGuideViewProps {
  onSelectView: (view: ViewId) => void;
  onOpenVoiceModal: () => void;
  onOpenCommandPalette: () => void;
}

interface GuideSectionItem {
  id: string;
  title: string;
  subtitle: string;
  category:
    | 'intelligence'
    | 'pipeline'
    | 'documents'
    | 'finance'
    | 'system'
    | 'global';
  categoryLabel: string;
  icon: React.FC<{ className?: string }>;
  coreMission: string;
  functionsList: string[];
  proTip: string;
  targetView?: ViewId;
  customAction?: 'voice' | 'command' | 'account';
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({
  onSelectView,
  onOpenVoiceModal,
  onOpenCommandPalette,
}) => {
  const { setIsAccountModalOpen } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [activeTourIndex, setActiveTourIndex] = useState<number | null>(null);

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const quickStartSteps = [
    {
      id: 1,
      title: '1. إنشاء حسابك المهني الحقيقي وتحديد مهاراتك',
      description:
        'ابدأ بضبط اسمك، تخصصك، سعر ساعتك الأساسي ($/hr)، ومهاراتك الحقيقية ليعتمد عليها المساعد الذكي "لينز إيه آي" في جميع الحسابات والتحليلات بدون أي بيانات زائفة.',
      actionLabel: 'فتح إعدادات الحساب الحقيقي',
      onAction: () => setIsAccountModalOpen(true),
    },
    {
      id: 2,
      title: '2. استكشاف أو إضافة فرصة عمل حقيقية في الرادار',
      description:
        'انتقل إلى "استكشاف الفرص" لإدراج فرصة عمل من Upwork أو Fiverr أو عميل مباشر، أو اطلب من "لينز إيه آي" ترشيح فرص مطابقة لمهاراتك.',
      actionLabel: 'فتح رادار الفرص',
      onAction: () => onSelectView('opportunities'),
    },
    {
      id: 3,
      title: '3. تحليل متطلبات العميل وكشف مخاطر تمدد النطاق (Scope Creep)',
      description:
        'الصق وصف مشروع العميل في "محلل المشاريع المتقدم" ليكشف لك "لينز إيه آي" البنود الغامضة، الفخاخ التعاقدية، الأسئلة الاستيضاحية، ونسبة توافق المشروع معك.',
      actionLabel: 'فتح محلل المشاريع',
      onAction: () => onSelectView('project-analyzer'),
    },
    {
      id: 4,
      title: '4. حساب التسعير العادل وصياغة العرض التنافسي (Proposal)',
      description:
        'استخدم "حاسبة التسعير التنافسي" لتحديد السعر المقترح والحد الأدنى للتفاوض، ثم انتقل إلى "مختبر صياغة العروض" لتوليد عرض مقنع مقسم إلى مراحل (Milestones) وبنود حماية النطاق.',
      actionLabel: 'فتح مختبر العروض',
      onAction: () => onSelectView('proposal-studio'),
    },
    {
      id: 5,
      title: '5. تتبع مراحل المشروع في كانبان وإدارة الدفعات المالية',
      description:
        'احفظ المشروع في "مسار المشاريع (Kanban)" لمتابعة حالته من التفاوض وحتى الإغلاق، وسجل دفعاتك المستلمة والمعلقة في "الإدارة المالية والتدفقات".',
      actionLabel: 'فتح لوحة كانبان',
      onAction: () => onSelectView('saved-projects'),
    },
  ];

  const allWebsiteSections: GuideSectionItem[] = [
    // Group 1: AI Intelligence
    {
      id: 'sec-overview',
      title: 'لوحة القيادة التنفيذية (Executive Overview)',
      subtitle: 'مركز المراقبة الشامل لحسابك ومشاريعك ومؤشراتك المالية',
      category: 'intelligence',
      categoryLabel: 'مركز الاستخبارات الذكية',
      icon: LayoutDashboard,
      coreMission:
        'تمنحك نظرة بانورامية فورية على حالة عملك الحر في شاشة واحدة دون الحاجة للتنقل بين عشرات الصفحات.',
      functionsList: [
        'عرض 6 عدادات رقمية حية (إجمالي المشاريع، المشاريع النشطة، الفرص عالية التوافق، العروض المرسلة، الإيرادات المستلمة، والمستحقات المعلقة).',
        'استعراض أحدث الفرص المضافة مع حلقة التوافق (Match Ring) وأزرار التحليل الفوري.',
        'مؤشر جاهزية الملف المهني والتقني ونسبة اكتمال مهاراتك ومعرض أعمالك.',
        'ملخص سريع لأحدث المشاريع في مسار كانبان وأزرار الوصول السريع للمحلل والمساعد الصوتي.',
      ],
      proTip:
        'اضغط على أي بطاقة من البطاقات الرقمية الست للانتقال مباشرة إلى القسم التفصيلي الخاص بها.',
      targetView: 'overview',
    },
    {
      id: 'sec-analyzer',
      title: 'محلل المشاريع المتقدم (Project Analyzer)',
      subtitle: 'فحص استخباراتي لمتطلبات العملاء وكشف مخاطر العقود قبل التقديم',
      category: 'intelligence',
      categoryLabel: 'مركز الاستخبارات الذكية',
      icon: ScanSearch,
      coreMission:
        'تحليل إعلانات المشاريع ومسودات العقود بالذكاء الاصطناعي العميق لاستخراج المتطلبات الخفية وحمايتك من المشاريع الخاسرة أو الغامضة.',
      functionsList: [
        'قياس نسبة التوافق المئوية (Match Score) بين متطلبات المشروع ومهاراتك الحقيقية.',
        'كشف إشارات الخطر وتمدد النطاق (Scope Creep Red Flags) وتصنيف خطورتها (عالية، متوسطة، منخفضة).',
        'توليد قائمة المخرجات المتوقعة (Deliverables) والمهارات الإلزامية والتقنيات المقترحة.',
        'توليد أسئلة استيضاحية ذكية لطرحها على العميل في المقابلة الأولى، مع إمكانية الاستماع للتقرير صوتياً أو تحويله مباشرة إلى عرض سعر.',
      ],
      proTip:
        'فعّل خيار "الاستدلال والتفكير العميق" عند تحليل العقود الكبيرة لتحصل على تشريح قانوني وتقني أدق.',
      targetView: 'project-analyzer',
    },
    {
      id: 'sec-proposal',
      title: 'مختبر صياغة العروض (Proposal Studio)',
      subtitle: 'هندسة عروض أسعار تنافسية بهيكلة نفسية وتعاقدية عالية القبول',
      category: 'intelligence',
      categoryLabel: 'مركز الاستخبارات الذكية',
      icon: FilePenLine,
      coreMission:
        'صياغة عروض احترافية مخصصة لكل مشروع ترفع نسبة رد العملاء وتثبت حدود النطاق منذ اللحظة الأولى.',
      functionsList: [
        'اختيار نبرة العرض (استشاري موثوق، تقني مباشر، إبداعي مقنع، أو تنفيذي سريع) مع تحديد الميزانية والمدة.',
        'تقسيم العرض تلقائياً إلى 5 أركان: الخطاف الافتتاحي (Hook)، تشخيص المشكلة، خارطة الطريق ومراحل التسليم، بنود خارج النطاق (Out of Scope)، والدعوة لاتخاذ إجراء.',
        'مؤشر قوة الإقناع (Persuasion Score) ونسخ النص الكامل أو حفظه في سجل العروض.',
      ],
      proTip:
        'قسم "ما لا يشمله العرض (Out of Scope)" هو درعك القانوني ضد التعديلات اللانهائية؛ احرص دائماً على إبقائه ضمن عرضك.',
      targetView: 'proposal-studio',
    },
    {
      id: 'sec-lens-chat',
      title: 'لينز إيه آي الذكي (Lens AI Consultant Chat)',
      subtitle: 'مستشارك الاستراتيجي والتقني والقانوني بكامل خبرات العمل الحر',
      category: 'intelligence',
      categoryLabel: 'مركز الاستخبارات الذكية',
      icon: MessageSquareCode,
      coreMission:
        'تقديم استشارات نصية وصوتية عميقة ومباشرة مرتبطة بملفك المهني الحقيقي وبأي مشروع تختاره من مسارك.',
      functionsList: [
        'سجل محادثات كامل محفوظ ومزامن يمكنك البحث فيه والعودة لأي استشارة سابقة في أي وقت.',
        'ربط الحوار بمشروع محدد من مشاريعك المحفوظة ليقدم لك "لينز إيه آي" إجابات مفصلة على مقاس ذلك المشروع.',
        'التحويل بين 3 أنماط ذكاء: سريع ومباشر، متوازن ودقيق، أو استدلال وتفكير عميق.',
        'دعم الإملاء الصوتي المباشر والاستماع لردود "لينز إيه آي" بصوت طبيعي.',
      ],
      proTip:
        'استخدم الأزرار الاستشارية الجاهزة أسفل المحادثة لصياغة بنود حماية العقود أو الرد على العميل الذي يطلب تخفيض السعر.',
      targetView: 'lens-chat',
    },

    // Group 2: Global Voice & Command Tools
    {
      id: 'sec-voice-live',
      title: 'المساعد الصوتي الحي — لينز إيه آي الصوتي (Voice Live)',
      subtitle: 'محادثة صوتية ثنائية الاتجاه مع رادار ترددي وسجل محادثات صوتية محفوظ',
      category: 'global',
      categoryLabel: 'أدوات الصوت والأوامر السريعة',
      icon: Mic,
      coreMission:
        'التحدث صوتياً وجهاً لوجه مع "لينز إيه آي" لمناقشة تسعير مشروع، التدرب على مقابلة عميل، أو طلب استشارة سريعة أثناء العمل.',
      functionsList: [
        'رادار صوتي تفاعلي يتفاعل لحظياً مع ترددات صوتك، مع دعم وضع المكالمة المستمرة أو الضغط للتحدث.',
        'سجل المحادثات الصوتية (Voice History): يحفظ كل جلسة صوتية وجميع المداخلات مع إمكانية إعادة تشغيل الصوت لأي رد سابق.',
        'زر "حفظ في سجل الدردشة" لنقل نص المحادثة الصوتية بالكامل إلى سجل محادثات "لينز إيه آي الذكي".',
        'اختيار لغة التحدث (العربية، الإنجليزية، الفرنسية، الإسبانية) واختيار نبرة الصوت المفضلة (Kore, Puck, Zephyr).',
      ],
      proTip:
        'يمكنك فتح المساعد الصوتي في أي لحظة من الزر الأخضر في أعلى يسار الشاشة أو عبر لوحة الأوامر.',
      customAction: 'voice',
    },
    {
      id: 'sec-command-palette',
      title: 'لوحة الأوامر والبحث السريع (Command Palette — Ctrl+K)',
      subtitle: 'مركز التحكم الفوري للتنقل وتنفيذ المهام من لوحة المفاتيح',
      category: 'global',
      categoryLabel: 'أدوات الصوت والأوامر السريعة',
      icon: Search,
      coreMission:
        'تمكينك من الانتقال لأي أداة أو تصدير نسخة احتياطية أو تشغيل المساعد الصوتي في أجزاء من الثانية.',
      functionsList: [
        'الفتح السريع بالضغط على (Ctrl+K أو Cmd+K) من أي مكان داخل الموقع.',
        'بحث فوري بالعربية أو الإنجليزية في جميع الصفحات والإجراءات السريعة.',
        'تنفيذ أوامر فورية مثل تصدير نسخة احتياطية كاملة (JSON) بضغطة واحدة.',
      ],
      proTip:
        'استخدم اختصار Ctrl+K أثناء التحدث مع العميل للقفز فوراً إلى حاسبة التسعير أو محلل المشاريع.',
      customAction: 'command',
    },

    // Group 3: Pipeline & Intake
    {
      id: 'sec-kanban',
      title: 'مسار المشاريع (Kanban & Table Pipeline)',
      subtitle: 'إدارة دورة حياة العقود والمشاريع من الاستكشاف وحتى الإغلاق',
      category: 'pipeline',
      categoryLabel: 'إدارة المشاريع والفرص',
      icon: Kanban,
      coreMission:
        'تنظيم جميع مشاريعك الحقيقية في لوحة كانبان مرئية أو جدول تفصيلي حتى لا تضيع أي فرصة أو موعد تسليم.',
      functionsList: [
        '6 مراحل واضحة: طلبات جديدة، تم التحليل بـ AI، تم تقديم العرض، انتظار رد العميل، قيد التنفيذ، ومكتمل.',
        'التبديل الفوري بين عرض لوحة كانبان (Kanban Board) وعرض الجدول التفصيلي (Table View).',
        'تغيير مرحلة المشروع بضغطة واحدة، أو فتحه مجدداً في المحلل أو مختبر العروض.',
      ],
      proTip:
        'كل مشروع تحلله في "محلل المشاريع" يمكنك حفظه بضغطة زر ليظهر تلقائياً في هذه اللوحة.',
      targetView: 'saved-projects',
    },
    {
      id: 'sec-opportunities',
      title: 'رادار استكشاف الفرص (Opportunities Radar)',
      subtitle: 'إدارة الفرص الحقيقية وترشيح فرص مطابقة لمهاراتك عبر لينز إيه آي',
      category: 'pipeline',
      categoryLabel: 'إدارة المشاريع والفرص',
      icon: Compass,
      coreMission:
        'تجميع الفرص التي تتابعها عبر المنصات العالمية وفلترتها حسب نسبة التوافق مع مهاراتك وسعر ساعتك.',
      functionsList: [
        'زر "+ إضافة فرصة عمل حقيقية" لإدراج أي مشروع من Upwork أو Fiverr Pro أوFreelancer أو عميل مباشر.',
        'زر "ترشيح فرص لمهاراتي عبر لينز إيه آي" لتوليد فرص عمل مصممة خصيصاً لمهارات حسابك وسعر ساعتك.',
        'فلترة متقدمة حسب المنصة، الكلمات المفتاحية، وشريط تمرير الحد الأدنى لنسبة التوافق.',
      ],
      proTip:
        'اضغط على "تحليل عبر لينز إيه آي" في أي بطاقة فرصة لنقل تفاصيلها مباشرة إلى محلل المشاريع.',
      targetView: 'opportunities',
    },
    {
      id: 'sec-workspace',
      title: 'تكامل Google Workspace (Forms, Gmail, Keep)',
      subtitle: 'أتمتة جمع متطلبات العملاء ومراسلات البريد والملاحظات السحابية',
      category: 'pipeline',
      categoryLabel: 'إدارة المشاريع والفرص',
      icon: FileSpreadsheet,
      coreMission:
        'ربط عملك الحر بحساب Google الخاص بك لإنشاء نماذج استبيان متطلبات العملاء وإرسال العروض عبر Gmail.',
      functionsList: [
        'إنشاء نماذج Google Forms حقيقية بضغطة زر (استبيان تطوير ويب، تطبيقات جوال، استشارات AI، أو هوية بصرية).',
        'جلب ردود العملاء من نماذج Google Forms وتحويل أي رد مباشرة إلى مشروع في محلل المشاريع.',
        'استعراض رسائل Gmail المتعلقة بالمشاريع وإرسال العروض الفنية مباشرة لبريد العميل، مع استعراض ملاحظات Google Keep.',
      ],
      proTip:
        'أرسل رابط نموذج Google Form للعميل قبل كتابة العقد ليملأ إجابات واضحة تمنع الخلافات لاحقاً.',
      targetView: 'google-forms',
    },

    // Group 4: Documents & Portfolio
    {
      id: 'sec-resume',
      title: 'محلل السيرة الذاتية (Resume Intelligence)',
      subtitle: 'تقييم سيرتك الذاتية ومطابقتها مع الأدوار المهنية العالمية',
      category: 'documents',
      categoryLabel: 'تحليل الملفات والخبرات',
      icon: FileUser,
      coreMission:
        'تحليل سيرتك الذاتية لاكتشاف نقاط القوة، الفجوات المهارية، واستيراد مهاراتك المعتمدة إلى ملفك المهني.',
      functionsList: [
        'رفع ملف السيرة الذاتية أو لصق محتواها وتحديد المسمى الوظيفي أو التخصص المستهدف.',
        'حساب نسبة المطابقة (Match Score) واستخراج المهارات التقنية ومستوى إتقانها تلقائياً.',
        'تقديم خطوات عملية لرفع جاذبية ملفك، مع زر "استيراد المهارات إلى ملفي المهني" بضغطة واحدة.',
      ],
      proTip:
        'بعد تحليل سيرتك الذاتية، اضغط على استيراد المهارات ليرتفع مؤشر جاهزية ملفك المهني فوراً.',
      targetView: 'resume-analyzer',
    },
    {
      id: 'sec-file-analysis',
      title: 'تحليل المستندات والتصاميم المتعددة الوسائط (Multimodal Analyzer)',
      subtitle: 'قراءة صور واجهات UI/UX والمخططات لتقدير ساعات البرمجة والتكلفة',
      category: 'documents',
      categoryLabel: 'تحليل الملفات والخبرات',
      icon: FileImage,
      coreMission:
        'مساعدتك عندما يرسل لك العميل صورة تصميم (Figma/PNG) أو مخططاً ويسألك: "كم يكلف تنفيذ هذا التصميم وكم يستغرق؟".',
      functionsList: [
        'رفع صور واجهات الاستخدام أو المخططات الهندسية لتحليلها برؤية الكمبيوتر (Computer Vision).',
        'استخراج قائمة المكونات البرمجية اللازمة لبناء الواجهة وتقييم تجربة المستخدم (UX Evaluation).',
        'تقدير عدد ساعات العمل الهندسي، النطاق السعري المقترح بالدولار، والمخاطر التقنية المتوقعة.',
      ],
      proTip:
        'استخدم تقدير الساعات الناتج من هذا القسم وأدخله في "حاسبة التسعير التنافسي" لتسعير التصاميم بدقة متناهية.',
      targetView: 'file-analysis',
    },
    {
      id: 'sec-portfolio',
      title: 'معرض الأعمال والخبرات (Portfolio Showcase)',
      subtitle: 'توثيق مشاريعك الناجحة والعائد الاستثماري (Impact Metrics) لعملائك',
      category: 'documents',
      categoryLabel: 'تحليل الملفات والخبرات',
      icon: Briefcase,
      coreMission:
        'بناء سجل أعمال احترافي يركز على الأثر التجاري والنتائج الرقمية لتعزيز ثقة العملاء بك.',
      functionsList: [
        'إضافة أعمالك السابقة مع التصنيف، التقنيات المستخدمة، ومؤشر الأثر التجاري (مثل: +40% سرعة الأداء).',
        'فلترة الأعمال حسب الفئة ومشاركة تفاصيلها عند التقديم على المشاريع المشابهة.',
      ],
      proTip:
        'إضافة مشاريع حقيقية في معرض أعمالك ترفع نسبة اكتمال ملفك المهني إلى 100%.',
      targetView: 'portfolio',
    },

    // Group 5: Pricing & Finance
    {
      id: 'sec-pricing',
      title: 'حاسبة التسعير التنافسي (Competitive Pricing Calculator)',
      subtitle: 'معادلات تسعير هندسية لحساب السعر المقترح وصافي الربح والحد الأدنى للتفاوض',
      category: 'finance',
      categoryLabel: 'التسعير والتدفقات المالية',
      icon: Calculator,
      coreMission:
        'حمايتك من التسعير العشوائي أو نسيان عمولات المنصات وتكلفة التعديلات والعمل المستعجل.',
      functionsList: [
        'ضبط عدد الساعات، سعر الساعة، معامل التعقيد، جولات المراجعة، عمولة المنصة (5% إلى 20%)، وخيار المشروع المستعجل (+25%).',
        'حساب فوري لـ 5 مؤشرات: التكلفة الأساسية، السعر المقترح للعميل، صافي ربحك، السعر الفعلي للساعة، والحد الأدنى للانسحاب (Walk-away Price).',
        'توليد 3 باقات تسعير جاهزة للعميل (الأساسية MVP، الاحترافية الموصى بها، والمؤسسية الشاملة).',
        'طلب استشارة تفاوضية من "لينز إيه آي" تعطيك سيناريو الرد على العميل وتقسيم الدفعات.',
      ],
      proTip:
        'لا تقبل أبداً بأقل من "الحد الأدنى للانسحاب (Walk-away Price)" دون تقليص نطاق المزايا المطلوبة.',
      targetView: 'pricing-calculator',
    },
    {
      id: 'sec-financials',
      title: 'الإدارة المالية والتدفقات (Financials & Cashflow)',
      subtitle: 'تتبع الدفعات المستلمة، المستحقات المعلقة، المصروفات، وتصدير التقارير',
      category: 'finance',
      categoryLabel: 'التسعير والتدفقات المالية',
      icon: Wallet,
      coreMission:
        'إدارة أموالك كمؤسسة احترافية ومعرفة صافي التدفق النقدي ومستحقات المراحل غير المحصلة.',
      functionsList: [
        'لوحة مؤشرات مالية لـ: الإيرادات المستلمة، دفعات المراحل المعلقة (Pending)، المصروفات التشغيلية، وصافي الربح.',
        'إضافة معاملات مالية جديدة (إيراد أو مصروف) وربطها بالمشاريع وتحديث حالتها.',
        'تصدير السجل المالي الكامل بصيغة CSV متوافقة مع Excel بترميز عربي واضح.',
      ],
      proTip:
        'سجل كل دفعة مرحلية (Milestone) فور الاتفاق عليها كـ "معلقة" ثم حولها إلى "مستلمة" عند التحصيل.',
      targetView: 'financials',
    },
    {
      id: 'sec-analytics',
      title: 'تحليلات قبول العروض (Proposal Analytics)',
      subtitle: 'قياس أداء عروضك المرسلة ومعدلات الفوز بالعقود حسب النبرة والمنصة',
      category: 'finance',
      categoryLabel: 'التسعير والتدفقات المالية',
      icon: BarChart3,
      coreMission:
        'تحليل تاريخ عروضك لمعرفة أي نبرة صياغة وأي منصة تحقق لك أعلى معدل فوز (Win Rate).',
      functionsList: [
        'حساب معدل قبول العروض، متوسط قوة الإقناع، وإجمالي قيمة العروض الفائزة.',
        'جدول تفصيلي لجميع العروض التي صغتها في المختبر وتاريخها وحالتها.',
      ],
      proTip:
        'راجع العروض ذات نسبة الإقناع الأعلى (+90%) واستفد من هيكلتها في مشاريعك القادمة.',
      targetView: 'proposal-analytics',
    },

    // Group 6: System & Account
    {
      id: 'sec-platforms',
      title: 'ربط المنصات الرقمية (Platform Connections)',
      subtitle: 'إدارة حالة الربط مع Upwork و Fiverr Pro و GitHub و LinkedIn و Google',
      category: 'system',
      categoryLabel: 'المنصات والإعدادات',
      icon: Link2,
      coreMission:
        'توحيد قنوات عملك الحر ومزامنة حالة الاتصال مع منصات العمل الحر وحساب Google السحابي.',
      functionsList: [
        'تفعيل أو إيقاف الربط مع المنصات المهنية ومراقبة حالة المزامنة.',
        'إدارة صلاحيات التكامل مع Google Workspace وقاعدة بيانات Firestore.',
      ],
      proTip:
        'اربط حساب Google الخاص بك لتفعيل المزامنة السحابية التلقائية بين جميع أجهزتك.',
      targetView: 'platform-connections',
    },
    {
      id: 'sec-profile',
      title: 'الملف المهني الموحد (Unified Professional Profile)',
      subtitle: 'إدارة هويتك المهنية، سعر ساعتك، ونبذتك الاستشارية ومهاراتك',
      category: 'system',
      categoryLabel: 'المنصات والإعدادات',
      icon: UserCheck,
      coreMission:
        'المصدر الأساسي الذي يقرأ منه "لينز إيه آي" بياناتك لتخصيص جميع التحليلات والعروض والتسعيرات.',
      functionsList: [
        'تعديل الاسم، المسمى المهني، البريد، سعر الساعة، وحالة التفرغ.',
        'إضافة أو حذف المهارات التقنية وتحديد مستوى الخبرة لكل مهارة.',
      ],
      proTip:
        'كلما حدثت مهاراتك وسعر ساعتك هنا، زادت دقة "لينز إيه آي" في حساب نسبة التوافق مع المشاريع.',
      targetView: 'profile',
    },
    {
      id: 'sec-notifications',
      title: 'مركز الإشعارات والتنبيهات (Notifications Center)',
      subtitle: 'سجل التنبيهات الذكية لحفظ المشاريع، استيراد المهارات، والعمليات المهمة',
      category: 'system',
      categoryLabel: 'المنصات والإعدادات',
      icon: Bell,
      coreMission:
        'إبقاؤك على اطلاع فوري بكل عملية تتم داخل مساحة عملك مع إمكانية الانتقال السريع لمصدر الإشعار.',
      functionsList: [
        'عرض التنبيهات مصنفة حسب النوع مع إمكانية تعليم الكل كمقروء أو مسح الإشعارات القديمة.',
      ],
      proTip:
        'يهتز جرس الإشعارات في الشريط العلوي تلقائياً عند وصول تنبيه جديد غير مقروء.',
      targetView: 'notifications',
    },
    {
      id: 'sec-settings',
      title: 'الإعدادات وقواعد البيانات والنسخ الاحتياطي (Settings & Backup)',
      subtitle: 'إدارة المزامنة السحابية، تصدير البيانات، وتصفير مساحة العمل',
      category: 'system',
      categoryLabel: 'المنصات والإعدادات',
      icon: Settings,
      coreMission:
        'منحك السيطرة الكاملة على بياناتك، خصوصيتك، والنسخ الاحتياطي المحلي والسحابي.',
      functionsList: [
        'تصدير نسخة احتياطية شاملة (Full JSON Backup) لجميع مشاريعك وعروضك ومعاملاتك.',
        'تصفير وإعادة ضبط مساحة العمل بالكامل بضغطة زر للبدء من الصفر في أي وقت.',
      ],
      proTip:
        'احتفظ بنسخة احتياطية JSON دورياً لتوثيق أرشيف مشاريعك وعقودك محلياً.',
      targetView: 'settings',
    },
  ];

  const categories = [
    { id: 'all', label: 'جميع أجزاء الموقع (19 قسماً)' },
    { id: 'intelligence', label: 'مركز الاستخبارات الذكية' },
    { id: 'global', label: 'المساعد الصوتي والأوامر السريعة' },
    { id: 'pipeline', label: 'إدارة المشاريع والفرص' },
    { id: 'documents', label: 'تحليل الملفات والخبرات' },
    { id: 'finance', label: 'التسعير والتدفقات المالية' },
    { id: 'system', label: 'المنصات والإعدادات' },
  ];

  const filteredSections = allWebsiteSections.filter((sec) => {
    const matchesCategory =
      selectedCategory === 'all' || sec.category === selectedCategory;
    const matchesSearch =
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.coreMission.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.functionsList.some((f) =>
        f.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleTriggerAction = (sec: GuideSectionItem) => {
    if (sec.customAction === 'voice') {
      onOpenVoiceModal();
    } else if (sec.customAction === 'command') {
      onOpenCommandPalette();
    } else if (sec.customAction === 'account') {
      setIsAccountModalOpen(true);
    } else if (sec.targetView) {
      onSelectView(sec.targetView);
    }
  };

  const activeTourItem =
    activeTourIndex !== null ? allWebsiteSections[activeTourIndex] : null;

  return (
    <div className="space-y-6">
      {/* 1. Hero Introduction Banner */}
      <GlassCard variant="hot" hoverable={false} className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2be38a]/15 border border-[#2be38a]/35 text-xs font-bold text-[#2be38a]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>دليل المستخدمين الجدد والخريطة الشاملة للمنصة</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-[#effaf4]">
              مرحباً بك في Firework AI — دليلك الكامل لإتقان المنصة ومهامها
            </h2>
            <p className="text-xs sm:text-sm text-[#a4c2b4] leading-relaxed">
              هذا التطبيق هو <strong className="text-[#effaf4]">نظام استخبارات وإدارة أعمال متكامل للمستقلين وأصحاب الوكالات</strong>. مهمته الأساسية هي حمايتك من العقود الخاسرة وتمدد النطاق (<span className="font-mono text-[#2be38a]">Scope Creep</span>)، قياس نسبة توافق المشاريع مع مهاراتك الحقيقية، تسعير عقودك علمياً، وصياغة عروض تنافسية فائزة بمساعدة مستشارك الذكي والصوتي <strong className="text-[#2be38a]">«لينز إيه آي» (Lens AI)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTourIndex(0)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_30px_rgba(43,227,138,0.3)] whitespace-nowrap"
            >
              <PlayCircle className="w-4 h-4" />
              <span>بدء الجولة الإرشادية التفاعلية</span>
            </button>

            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[#effaf4] font-semibold text-xs transition-colors whitespace-nowrap"
            >
              <Mic className="w-4 h-4 text-[#2be38a]" />
              <span>اسأل لينز إيه آي صوتياً</span>
            </button>
          </div>
        </div>

        {/* 4 Core Pillars Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/15">
          {[
            {
              title: '1. الفحص وكشف المخاطر',
              desc: 'تحليل متطلبات العميل وكشف الفخاخ التعاقدية وتمدد النطاق قبل التقديم.',
              color: 'text-[#2be38a]',
            },
            {
              title: '2. التسعير وصياغة العروض',
              desc: 'حساب السعر العادل والحد الأدنى للتفاوض وتوليد عروض مقسمة لمراحل.',
              color: 'text-[#62d9ff]',
            },
            {
              title: '3. المساعد الذكي «لينز إيه آي»',
              desc: 'مستشار نصي وصوتي حي مع سجل محادثات كامل يعمل بكامل خبرات العمل الحر.',
              color: 'text-[#ffc15a]',
            },
            {
              title: '4. إدارة المسار والمالية',
              desc: 'متابعة المشاريع في لوحة كانبان، ربط Google Workspace، وإدارة الدفعات.',
              color: 'text-[#effaf4]',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1"
            >
              <div className={`text-xs font-bold ${pillar.color}`}>
                {pillar.title}
              </div>
              <p className="text-[11px] text-[#a4c2b4] leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Interactive Guided Tour Stepper Modal (when active) */}
      {activeTourItem && activeTourIndex !== null && (
        <GlassCard variant="cyan" hoverable={false} className="p-6 border-2 border-[#62d9ff]/50">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#62d9ff] text-[#020504] font-mono text-xs font-bold">
                محطة {activeTourIndex + 1} من {allWebsiteSections.length}
              </span>
              <span className="text-xs text-[#62d9ff] font-semibold">
                {activeTourItem.categoryLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTourIndex(null)}
              className="text-xs text-[#a4c2b4] hover:text-[#effaf4] px-3 py-1 rounded-lg bg-white/5"
            >
              إنهاء الجولة الإرشادية
            </button>
          </div>

          <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-xl font-bold text-[#effaf4]">
                {activeTourItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#2be38a] font-medium">
                المهمة الأساسية: {activeTourItem.coreMission}
              </p>
              <ul className="space-y-1.5 text-xs text-[#a4c2b4]">
                {activeTourItem.functionsList.map((fn, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2be38a] shrink-0 mt-0.5" />
                    <span>{fn}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 p-4 rounded-2xl bg-black/40 border border-white/15">
              <div className="text-xs text-[#ffc15a] font-semibold">
                💡 نصيحة لينز إيه آي:
              </div>
              <p className="text-xs text-[#effaf4] leading-relaxed">
                {activeTourItem.proTip}
              </p>
              <button
                type="button"
                onClick={() => handleTriggerAction(activeTourItem)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
              >
                <span>تجربة هذا القسم الآن</span>
                <ArrowUpLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/15">
            <button
              type="button"
              disabled={activeTourIndex === 0}
              onClick={() =>
                setActiveTourIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#effaf4] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
              <span>القسم السابق</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTourIndex((prev) =>
                  prev !== null && prev < allWebsiteSections.length - 1
                    ? prev + 1
                    : null
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110"
            >
              <span>
                {activeTourIndex < allWebsiteSections.length - 1
                  ? 'القسم التالي في الجولة'
                  : 'إتمام الجولة'}
              </span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* 2. Step-by-Step Interactive Roadmap for New Users */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#effaf4] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2be38a]" />
              <span>كيف تبدأ كمستخدم جديد؟ (مسار العمل الموصى به في 5 خطوات)</span>
            </h3>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              اتبع هذه الخطوات الخمس بالترتيب لتحقيق أقصى استفادة من المنصة منذ يومك الأول
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#2be38a]/15 border border-[#2be38a]/30 text-xs font-mono text-[#2be38a] font-bold shrink-0">
            تم إنجاز {completedSteps.length} / {quickStartSteps.length} خطوات
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {quickStartSteps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  isDone
                    ? 'liquid-glass-hot border-[#2be38a]/45'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-[#62d9ff] font-bold">
                      خطوة {step.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStepCompletion(step.id)}
                      className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md ${
                        isDone
                          ? 'bg-[#2be38a]/20 text-[#2be38a] font-bold'
                          : 'bg-white/5 text-[#a4c2b4]'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isDone ? 'مكتملة' : 'تحديد كمكتملة'}</span>
                    </button>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#effaf4] leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#a4c2b4] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={step.onAction}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-[#2be38a] hover:text-[#020504] border border-white/15 text-xs font-semibold text-[#effaf4] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. Detailed Directory of Every Website Part & Function */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#effaf4]">
              الدليل التفصيلي لوظائف كل جزء وقسم في الموقع ({allWebsiteSections.length} وحدة وأداة)
            </h3>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              تعرّف على مهمة كل شاشة، الأدوات الموجودة بداخلها، وكيف تستخدمها باحترافية
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6c8a7d] absolute right-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أي أداة أو وظيفة في الموقع..."
              className="w-full pr-10 pl-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4] placeholder-[#6c8a7d] focus:outline-none focus:border-[#2be38a]"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#2be38a] text-[#020504] font-bold shadow-[0_0_20px_rgba(43,227,138,0.25)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#a4c2b4] hover:text-[#effaf4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="p-5 rounded-2xl liquid-glass flex flex-col justify-between space-y-4 border border-white/15 hover:border-[#2be38a]/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#2be38a]/15 border border-[#2be38a]/35 flex items-center justify-center text-[#2be38a] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#62d9ff]">
                          {sec.categoryLabel}
                        </span>
                        <h4 className="text-base font-bold text-[#effaf4]">
                          {sec.title}
                        </h4>
                        <p className="text-xs text-[#a4c2b4]">{sec.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Mission Box */}
                  <div className="p-3 rounded-xl bg-black/35 border border-white/10 text-xs leading-relaxed">
                    <strong className="text-[#2be38a] ml-1">مهمة هذا الجزء:</strong>
                    <span className="text-[#effaf4]">{sec.coreMission}</span>
                  </div>

                  {/* Detailed Functions List */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#a4c2b4]">
                      أبرز الوظائف والأدوات بالداخل:
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#effaf4]/90">
                      {sec.functionsList.map((fn, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2be38a] shrink-0 mt-1" />
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pro Tip + Direct Navigation CTA */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-[#ffc15a]">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>نصيحة لينز إيه آي:</strong> {sec.proTip}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTriggerAction(sec)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2be38a]/20 to-[#62d9ff]/20 hover:from-[#2be38a] hover:to-[#62d9ff] text-[#effaf4] hover:text-[#020504] border border-[#2be38a]/35 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>افتح «{sec.title.split('(')[0].trim()}» الآن</span>
                    <ArrowUpLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 4. Quick FAQ for New Users */}
      <GlassCard variant="cyan" className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[#effaf4]">
          <ShieldCheck className="w-5 h-5 text-[#2be38a]" />
          <span>إجابات سريعة لأهم أسئلة المستخدمين الجدد</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-1.5">
            <div className="font-bold text-[#2be38a]">
              كيف يعمل المساعد الذكي والصوتي «لينز إيه آي»؟
            </div>
            <p className="text-[#a4c2b4] leading-relaxed">
              يقرأ «لينز إيه آي» مهاراتك وسعر ساعتك ومشاريعك المحفوظة تلقائياً، ويمكنك محادثته نصياً في قسم «لينز إيه آي الذكي» أو صوتياً عبر زر «لينز إيه آي الصوتي» في أعلى الشاشة مع حفظ كامل سجل محادثاتك.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-1.5">
            <div className="font-bold text-[#62d9ff]">
              أين تُحفظ بياناتي ومشاريعي التي أضيفها؟
            </div>
            <p className="text-[#a4c2b4] leading-relaxed">
              تُحفظ جميع بياناتك فورياً في متصفحك، وعند تسجيل الدخول بحساب Google تتم مزامنتها لحظياً في قاعدة بيانات Firebase Firestore السحابية الخاصة بحسابك مع إمكانية تصديرها كملف JSON في أي وقت.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-1.5">
            <div className="font-bold text-[#ffc15a]">
              ما هي أسرع طريقة للتنقل بين أدوات الموقع؟
            </div>
            <p className="text-[#a4c2b4] leading-relaxed">
              اضغط على اختصار لوحة المفاتيح <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 font-mono text-[#effaf4]">Ctrl+K</kbd> لفتح لوحة الأوامر السريعة والوصول لأي أداة أو ميزة في ثانية واحدة.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
