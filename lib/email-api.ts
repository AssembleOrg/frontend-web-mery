import { apiRequest } from './api-client';

export interface CampaignRecipient {
  id: string;
  email: string;
  name: string;
}

export interface CampaignResult {
  dryRun: boolean;
  requestedBy: string;
  total: number;
  recipients: CampaignRecipient[];
  sent: number;
  failed: Array<{ email: string; error: string }>;
}

export const emailApi = {
  formacionesCampaign: (limit = 150, confirm = false, recipients?: CampaignRecipient[]) =>
    apiRequest<CampaignResult>('/email/campaigns/formaciones/send', {
      method: 'POST',
      body: JSON.stringify({ limit, confirm, recipients }),
    }),
};
