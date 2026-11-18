import { getAccessToken } from './firebase';

export interface IntakeQuestionTemplate {
  id: string;
  label: string;
  defaultTitle: string;
  description: string;
  questions: string[];
}

export const INTAKE_TEMPLATES: IntakeQuestionTemplate[] = [
  {
    id: 'web_dev',
    label: 'تطوير منصات وتطبيقات ويب (Web & SaaS)',
    defaultTitle: 'استبيان متطلبات تطوير منصة ويب — Firework AI',
    description: 'نموذج استكشاف المتطلبات التقنية والتجارية لتطوير تطبيقات الويب والمنصات السحابية.',
    questions: [
      'ما هو الهدف التجاري الرئيسي من إطلاق المنصة، ومن هي الفئة المستهدفة؟',
      'ما هي المزايا الأساسية الثلاث المطلوبة في الإطلاق الأول (MVP)؟',
      'هل تتوفر تصاميم واجهات (Figma / UI) جاهزة أم تحتاجون لتصميم كامل؟',
      'ما هي الميزانية التقديرية المرصودة والجدول الزمني المستهدف للإطلاق؟',
      'هل هناك تكاملات خارجية مطلوبة (بوابات دفع، أنظمة CRM، ذكاء اصطناعي)؟',
    ],
  },
  {
    id: 'mobile_app',
    label: 'تطوير تطبيقات الجوال (iOS & Android)',
    defaultTitle: 'استبيان متطلبات تطبيق الجوال — Firework AI',
    description: 'يرجى تعبئة هذا النموذج لتحديد نطاق تطبيق الجوال والمنصات المستهدفة.',
    questions: [
      'هل التطبيق مستهدف لنظام iOS، Android، أم كليهما معاً (Cross-Platform)؟',
      'هل يحتاج التطبيق إلى العمل دون اتصال بالإنترنت (Offline Mode) أو إشعارات فورية؟',
      'ما هي رحلة المستخدم الأساسية منذ فتح التطبيق وحتى إتمام العملية؟',
      'ما هي الميزانية المرصودة وتاريخ الإطلاق المفضل على المتاجر؟',
    ],
  },
  {
    id: 'branding_ui',
    label: 'تصميم الهوية البصرية وتجربة المستخدم (UI/UX)',
    defaultTitle: 'استبيان تصميم الهوية وتجربة المستخدم — Firework AI',
    description: 'يساعدنا هذا الاستبيان على فهم شخصية علامتكم التجارية وتطلعاتكم البصرية.',
    questions: [
      'ما هي القيم الثلاث الأهم التي تودون أن تعكسها الهوية البصرية أو الواجهة؟',
      'اذكر 2-3 أمثلة لمواقع أو تطبيقات تعجبكم من حيث التصميم وتجربة الاستخدام.',
      'ما هي الصفحات أو الشاشات الرئيسية المطلوب تصميمها وتسليمها؟',
      'ما هو الموعد النهائي لاستلام ملفات التصميم المعتمدة؟',
    ],
  },
  {
    id: 'ai_automation',
    label: 'حلول الذكاء الاصطناعي والأتمتة (AI & Agents)',
    defaultTitle: 'استبيان حلول الذكاء الاصطناعي والأتمتة — Firework AI',
    description: 'تحديد مسارات العمل والبيانات المطلوب أتمتتها باستخدام نماذج الذكاء الاصطناعي.',
    questions: [
      'ما هي العملية اليدوية الحالية التي تستهلك أكبر وقت في فريقكم وترغبون بأتمتتها؟',
      'ما نوع البيانات المدخلة (نصوص، مستندات PDF، صوتيات، صور، قواعد بيانات)؟',
      'ما هي النتيجة المتوقعة ومؤشر النجاح (KPI) بعد تطبيق الحل الذكي؟',
      'ما هو نطاق الميزانية المرصودة للمشروع التجريبي (PoC / MVP)؟',
    ],
  },
];

export async function createGoogleForm(params: {
  title: string;
  description: string;
  questions: string[];
}): Promise<{
  formId: string;
  responderUri: string;
  editUri: string;
}> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  // Step 1: Create the form with info.title
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: params.title,
        documentTitle: params.title,
      },
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`فشل إنشاء النموذج في Google Forms: ${createRes.status} ${errBody}`);
  }

  const createdForm = await createRes.json();
  const formId = createdForm.formId;
  const safeFormId = encodeURIComponent(String(formId).trim());

  // Step 2: BatchUpdate to add description and questions
  const requests: any[] = [];
  if (params.description) {
    requests.push({
      updateFormInfo: {
        info: {
          description: params.description,
        },
        updateMask: 'description',
      },
    });
  }

  params.questions.forEach((qText, index) => {
    requests.push({
      createItem: {
        item: {
          title: qText,
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                paragraph: true,
              },
            },
          },
        },
        location: {
          index,
        },
      },
    });
  });

  if (requests.length > 0) {
    await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
  }

  return {
    formId,
    responderUri: createdForm.responderUri || `https://docs.google.com/forms/d/${safeFormId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${safeFormId}/edit`,
  };
}

export async function fetchGoogleFormResponses(formId: string): Promise<
  Array<{
    responseId: string;
    createTime: string;
    summaryText: string;
  }>
> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const safeFormId = encodeURIComponent(formId.trim());
  const [formRes, respRes] = await Promise.all([
    fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!respRes.ok) {
    throw new Error(`تعذر جلب الردود: ${respRes.status}`);
  }

  const formData = formRes.ok ? await formRes.json() : { items: [] };
  const questionMap: Record<string, string> = {};
  if (Array.isArray(formData.items)) {
    for (const item of formData.items) {
      const qId = item?.questionItem?.question?.questionId;
      if (qId && item.title) {
        questionMap[qId] = item.title;
      }
    }
  }

  const respData = await respRes.json();
  const responses = Array.isArray(respData.responses) ? respData.responses : [];

  return responses.map((r: any) => {
    const answersObj = r.answers || {};
    const lines: string[] = [];
    for (const [qId, ans] of Object.entries<any>(answersObj)) {
      const qTitle = questionMap[qId] || `سؤال (${qId})`;
      const val =
        ans?.textAnswers?.answers?.map((a: any) => a.value).join('، ') || '';
      if (val) {
        lines.push(`• ${qTitle}:\n  ${val}`);
      }
    }
    return {
      responseId: r.responseId || String(Math.random()),
      createTime: r.createTime || new Date().toISOString(),
      summaryText: lines.join('\n\n') || 'رد عميل مستلم عبر Google Forms',
    };
  });
}

// Gmail Integration Helpers (Read project threads & Send proposal email with mandatory confirmation)
export async function fetchRecentGmailMessages(maxResults = 5): Promise<
  Array<{
    id: string;
    subject: string;
    from: string;
    snippet: string;
    date: string;
  }>
> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!listRes.ok) {
    throw new Error(`فشل جلب رسائل Gmail: ${listRes.status}`);
  }
  const listData = await listRes.json();
  const messages = Array.isArray(listData.messages) ? listData.messages : [];

  const details = await Promise.all(
    messages.slice(0, maxResults).map(async (m: any) => {
      const safeId = encodeURIComponent(String(m.id));
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${safeId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!detailRes.ok) return null;
      const d = await detailRes.json();
      const headers = Array.isArray(d.payload?.headers) ? d.payload.headers : [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
      return {
        id: d.id,
        subject: getHeader('Subject') || '(بدون عنوان)',
        from: getHeader('From') || 'عميل محتمل',
        date: getHeader('Date') || '',
        snippet: d.snippet || '',
      };
    })
  );

  return details.filter(Boolean) as any[];
}

export async function sendGmailProposal(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const messageParts = [
    `To: ${params.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    params.body,
  ];
  const rawMessage = messageParts.join('\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    }
  );

  if (!sendRes.ok) {
    const errText = await sendRes.text();
    throw new Error(`فشل إرسال البريد عبر Gmail: ${sendRes.status} ${errText}`);
  }

  return await sendRes.json();
}

// Google Keep Integration Helper (with graceful enterprise scope note)
export async function fetchGoogleKeepNotes(): Promise<
  Array<{ id: string; title: string; body: string; createTime: string }>
> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await fetch('https://keep.googleapis.com/v1/notes?pageSize=10', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`KEEP_ENTERPRISE_SCOPE_RESTRICTION:${res.status}`);
  }

  const data = await res.json();
  const notes = Array.isArray(data.notes) ? data.notes : [];
  return notes.map((n: any) => ({
    id: n.name || String(Math.random()),
    title: n.title || 'ملاحظة مشروع',
    body: n.body?.text?.text || '',
    createTime: n.createTime || new Date().toISOString(),
  }));
}
