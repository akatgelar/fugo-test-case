import type { AiPriority, AiStatus, BudgetRange, PipelineStatus, Prisma, ServiceCategory } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rows: {
  company: string;
  budget: BudgetRange;
  pipeline: PipelineStatus;
  ai: AiStatus;
  priority: AiPriority | null;
  category: ServiceCategory | null;
}[] = [
  { company: 'Nusantara Food', budget: 'from_25_50', pipeline: 'new', ai: 'succeeded', priority: 'high', category: 'website' },
  { company: 'Bank Sinarmas Digital', budget: 'above_100', pipeline: 'contacted', ai: 'succeeded', priority: 'high', category: 'mobile_app' },
  { company: 'Kopi Kenangan Nusantara', budget: 'from_10_25', pipeline: 'proposal', ai: 'succeeded', priority: 'medium', category: 'social_media' },
  { company: 'PT Sinar Abadi Logistik', budget: 'from_50_100', pipeline: 'new', ai: 'failed', priority: null, category: null },
  { company: 'Rumah Sakit Bunda Sehat', budget: 'from_25_50', pipeline: 'contacted', ai: 'succeeded', priority: 'medium', category: 'branding' },
  { company: 'Gudang Sepatu Bandung', budget: 'under_10', pipeline: 'lost', ai: 'succeeded', priority: 'low', category: 'website' },
  { company: 'Arunika Wedding Organizer', budget: 'from_10_25', pipeline: 'won', ai: 'succeeded', priority: 'medium', category: 'other' },
  { company: 'Tani Makmur Agritech', budget: 'from_50_100', pipeline: 'new', ai: 'processing', priority: null, category: null },
  { company: 'Sekolah Cendekia Harapan', budget: 'under_10', pipeline: 'new', ai: 'pending', priority: null, category: null },
  { company: 'Bengkel Motor Jaya', budget: 'under_10', pipeline: 'lost', ai: 'succeeded', priority: 'low', category: 'social_media' },
  { company: 'Cendekia Harapan', budget: 'from_25_50', pipeline: 'proposal', ai: 'succeeded', priority: 'high', category: 'website' },
  { company: 'Aroma Kopi Nusantara', budget: 'from_10_25', pipeline: 'new', ai: 'failed', priority: null, category: null },
  { company: 'Rumah Sakit Bunda Sehat', budget: 'from_50_100', pipeline: 'contacted', ai: 'succeeded', priority: 'medium', category: 'ai_automation' },
  { company: 'Sentosa Retail Group', budget: 'above_100', pipeline: 'new', ai: 'succeeded', priority: 'high', category: 'ai_automation' },
];

async function main() {
  const existing = await prisma.brief.count({ where: { ref: { startsWith: 'DM-' } } });
  if (existing > 0) {
    console.log(`Demo briefs sudah ada (${existing}).`);
    return;
  }

  const data: Prisma.BriefCreateManyInput[] = rows.map((row, index) => ({
    ref: `DM-${1001 + index}`,
    name: 'Demo User',
    email: `demo${index + 1}@contoh.co`,
    company: row.company,
    needDescription: 'Brief contoh untuk demo pagination, filter, dan status di dashboard.',
    budgetRange: row.budget,
    targetTimeline: new Date(Date.now() + (index + 5) * 86400000),
    pipelineStatus: row.pipeline,
    aiStatus: row.ai,
    aiAttemptCount: row.ai === 'pending' ? 0 : 1,
    aiSummary: row.ai === 'succeeded' ? 'Ringkasan contoh: klien membutuhkan bantuan desain dan pengembangan.' : null,
    aiServiceCategory: row.category,
    aiPriority: row.priority,
    aiPriorityReason: row.ai === 'succeeded' ? 'Alasan prioritas contoh untuk demo.' : null,
    aiMissingInfo: row.ai === 'succeeded' ? ['Referensi visual', 'PIC teknis'] : [],
    aiModel: row.ai === 'succeeded' ? 'deepseek-chat' : null,
    aiProcessedAt: row.ai === 'succeeded' ? new Date() : null,
  }));

  await prisma.brief.createMany({ data });
  console.log(`Menambahkan ${data.length} brief demo.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
