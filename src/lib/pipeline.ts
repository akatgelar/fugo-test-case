import type { PipelineStatus } from '@prisma/client';

export const pipelineTransitions: Record<PipelineStatus, PipelineStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: ['contacted'],
};

export const pipelineActionLabels: Record<PipelineStatus, string> = {
  new: 'New',
  contacted: 'Tandai Contacted',
  proposal: 'Kirim Proposal',
  won: 'Tandai Won',
  lost: 'Tandai Lost',
};
