import {
  cagnotteValidatedEmail,
  cagnotteRejectedEmail,
  cagnotteDocumentsRequestedEmail,
  cagnottePayoutEmail,
} from './emailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log('========== EMAIL NOTIFICATION ==========');
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log('=========================================');
  return true;
}

interface CagnotteNotificationData {
  organizerEmail: string;
  organizerName: string;
  cagnotteTitle: string;
  goalAmount?: number;
  currentAmount?: number;
  reason?: string;
}

export async function sendCagnotteValidatedEmail(data: CagnotteNotificationData): Promise<boolean> {
  const email = cagnotteValidatedEmail({
    cagnotteTitle: data.cagnotteTitle,
    organizerName: data.organizerName,
    goalAmount: data.goalAmount,
  });
  
  return sendEmail({
    to: data.organizerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendCagnotteRejectedEmail(data: CagnotteNotificationData): Promise<boolean> {
  const email = cagnotteRejectedEmail({
    cagnotteTitle: data.cagnotteTitle,
    organizerName: data.organizerName,
    reason: data.reason,
  });
  
  return sendEmail({
    to: data.organizerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendCagnotteDocumentsRequestedEmail(data: CagnotteNotificationData): Promise<boolean> {
  const email = cagnotteDocumentsRequestedEmail({
    cagnotteTitle: data.cagnotteTitle,
    organizerName: data.organizerName,
    reason: data.reason,
  });
  
  return sendEmail({
    to: data.organizerEmail,
    subject: email.subject,
    html: email.html,
  });
}

interface CagnottePayoutNotificationData {
  organizerEmail: string;
  organizerName: string;
  cagnotteTitle: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
}

export async function sendCagnottePayoutEmail(data: CagnottePayoutNotificationData): Promise<boolean> {
  const email = cagnottePayoutEmail({
    cagnotteTitle: data.cagnotteTitle,
    organizerName: data.organizerName,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    receiptNumber: data.receiptNumber,
  });
  
  return sendEmail({
    to: data.organizerEmail,
    subject: email.subject,
    html: email.html,
  });
}
