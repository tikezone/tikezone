const baseStyles = `
  body { margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
  .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; }
  .logo { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -1px; }
  .logo-zone { color: #ffffff; }
  .content { padding: 40px 32px; }
  .title { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; }
  .text { font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0; }
  .highlight-box { background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
  .code { font-size: 32px; font-weight: 900; color: #f97316; letter-spacing: 8px; font-family: monospace; }
  .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff !important; font-weight: 700; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; margin: 8px 0; }
  .info-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .info-label { color: #71717a; font-size: 13px; }
  .info-value { color: #ffffff; font-weight: 600; font-size: 14px; }
  .footer { background: rgba(0,0,0,0.5); padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); }
  .footer-text { font-size: 12px; color: #52525b; margin: 4px 0; }
  .footer-link { color: #f97316; text-decoration: none; }
  .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 24px 0; }
  .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0; }
  .warning-text { color: #fca5a5; font-size: 13px; margin: 0; }
  .success-icon { font-size: 48px; margin-bottom: 16px; }
`;

const wrapHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIKEZONE</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div style="padding: 20px; background-color: #000000;">
    <div class="container">
      <div class="header">
        <div class="logo">TIKE<span class="logo-zone">ZONE</span></div>
      </div>
      ${content}
    </div>
  </div>
</body>
</html>
`;

export function welcomeEmail(userName: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">🎉</div>
      </div>
      <h1 class="title" style="text-align: center;">Bienvenue sur TIKEZONE !</h1>
      <p class="text" style="text-align: center;">
        Salut <strong style="color: #ffffff;">${userName}</strong>,<br><br>
        Ton compte a été créé avec succès. Tu fais maintenant partie de la communauté TIKEZONE, la billetterie la plus fun d'Afrique !
      </p>
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Ce que tu peux faire maintenant :</p>
        <p class="text" style="margin: 8px 0;">✨ Découvrir les événements près de chez toi</p>
        <p class="text" style="margin: 8px 0;">🎫 Réserver tes places en quelques clics</p>
        <p class="text" style="margin: 8px 0;">💜 Gagner des vibes avec TikeClub</p>
        <p class="text" style="margin: 8px 0;">📲 Recevoir tes billets par email ou WhatsApp</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com" class="button">Découvrir les événements</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
      <p class="footer-text">Conçu avec passion pour sublimer vos événements</p>
    </div>
  `;
  
  return {
    subject: '🎉 Bienvenue sur TIKEZONE !',
    html: wrapHtml(content)
  };
}

export function verificationCodeEmail(code: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1 class="title">Vérification de ton compte</h1>
      <p class="text">
        Utilise ce code pour confirmer ton adresse email. Ce code expire dans 10 minutes.
      </p>
      
      <div class="highlight-box">
        <div class="code">${code}</div>
      </div>
      
      <div class="warning-box">
        <p class="warning-text">
          ⚠️ Ne partage jamais ce code avec personne. L'équipe TIKEZONE ne te demandera jamais ce code.
        </p>
      </div>
      
      <p class="text" style="font-size: 13px;">
        Si tu n'as pas demandé ce code, ignore simplement cet email.
      </p>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
    </div>
  `;
  
  return {
    subject: '🔐 Code de vérification TIKEZONE',
    html: wrapHtml(content)
  };
}

export function passwordResetEmail(resetLink: string, code?: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1 class="title">Réinitialisation du mot de passe</h1>
      <p class="text">
        Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>
      
      ${code ? `
      <div class="highlight-box">
        <p style="color: #a1a1aa; margin: 0 0 12px 0; font-size: 13px;">Ou utilise ce code :</p>
        <div class="code">${code}</div>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
      </div>
      
      <div class="warning-box">
        <p class="warning-text">
          ⚠️ Ce lien expire dans 1 heure. Si tu n'as pas fait cette demande, ignore cet email.
        </p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
    </div>
  `;
  
  return {
    subject: '🔑 Réinitialise ton mot de passe TIKEZONE',
    html: wrapHtml(content)
  };
}

export function passwordChangedEmail(userName: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">✅</div>
      </div>
      <h1 class="title" style="text-align: center;">Mot de passe modifié</h1>
      <p class="text" style="text-align: center;">
        Salut <strong style="color: #ffffff;">${userName}</strong>,<br><br>
        Ton mot de passe a été modifié avec succès.
      </p>
      
      <div class="warning-box">
        <p class="warning-text">
          ⚠️ Si tu n'as pas effectué cette modification, contacte-nous immédiatement à support@tikezone.com
        </p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
    </div>
  `;
  
  return {
    subject: '✅ Mot de passe modifié - TIKEZONE',
    html: wrapHtml(content)
  };
}

export function accountDeletedEmail(userName: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h1 class="title">Compte supprimé</h1>
      <p class="text">
        Salut <strong style="color: #ffffff;">${userName}</strong>,<br><br>
        Ton compte TIKEZONE a été supprimé avec succès. Nous sommes tristes de te voir partir.
      </p>
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Ce qui a été supprimé :</p>
        <p class="text" style="margin: 8px 0;">• Tes informations personnelles</p>
        <p class="text" style="margin: 8px 0;">• Ton historique de réservations</p>
        <p class="text" style="margin: 8px 0;">• Tes favoris et préférences</p>
        <p class="text" style="margin: 8px 0;">• Tes vibes TikeClub</p>
      </div>
      
      <p class="text">
        Tu peux toujours revenir quand tu veux. La porte est toujours ouverte ! 👋
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/register" class="button">Créer un nouveau compte</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
    </div>
  `;
  
  return {
    subject: '👋 Au revoir - Compte TIKEZONE supprimé',
    html: wrapHtml(content)
  };
}

interface TicketEmailData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrCodeUrl?: string;
  bookingRef: string;
}

export function ticketConfirmationEmail(data: TicketEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">🎫</div>
      </div>
      <h1 class="title" style="text-align: center;">Réservation confirmée !</h1>
      <p class="text" style="text-align: center;">
        Super ! Ta réservation pour <strong style="color: #f97316;">${data.eventTitle}</strong> est confirmée.
      </p>
      
      <div class="info-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Événement</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.eventTitle}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Date & Heure</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.eventDate} à ${data.eventTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Lieu</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.eventLocation}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Type de billet</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.ticketType} x${data.quantity}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #71717a; font-size: 13px;">Total payé</span><br>
              <span style="color: #f97316; font-weight: 900; font-size: 20px;">${data.totalPrice.toLocaleString('fr-FR')} F CFA</span>
            </td>
          </tr>
        </table>
      </div>
      
      <div class="highlight-box">
        <p style="color: #a1a1aa; margin: 0 0 8px 0; font-size: 13px;">Référence de réservation</p>
        <div class="code" style="font-size: 20px; letter-spacing: 4px;">${data.bookingRef}</div>
      </div>
      
      <p class="text" style="text-align: center; font-size: 13px;">
        Présente ce QR code ou cette référence à l'entrée de l'événement.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/profile" class="button">Voir mon billet</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
      <p class="footer-text">Conçu avec passion pour sublimer vos événements</p>
    </div>
  `;
  
  return {
    subject: `🎫 Billet confirmé - ${data.eventTitle}`,
    html: wrapHtml(content)
  };
}

// ==================== CAGNOTTE EMAIL TEMPLATES ====================

interface CagnotteEmailData {
  cagnotteTitle: string;
  organizerName: string;
  goalAmount?: number;
  currentAmount?: number;
  reason?: string;
}

export function cagnotteValidatedEmail(data: CagnotteEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">🎉</div>
      </div>
      <h1 class="title" style="text-align: center;">Cagnotte validee !</h1>
      <p class="text" style="text-align: center;">
        Felicitations <strong style="color: #ffffff;">${data.organizerName}</strong>,<br><br>
        Votre cagnotte <strong style="color: #f97316;">"${data.cagnotteTitle}"</strong> a ete validee par notre equipe et est maintenant en ligne !
      </p>
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Prochaines etapes :</p>
        <p class="text" style="margin: 8px 0;">📢 Partagez votre cagnotte sur les reseaux sociaux</p>
        <p class="text" style="margin: 8px 0;">💰 Objectif : ${data.goalAmount?.toLocaleString('fr-FR') || 0} F CFA</p>
        <p class="text" style="margin: 8px 0;">📊 Suivez les contributions en temps reel</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/organizer/cagnottes" class="button">Voir ma cagnotte</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits reserves.</p>
    </div>
  `;
  
  return {
    subject: '🎉 Cagnotte validee - ' + data.cagnotteTitle,
    html: wrapHtml(content)
  };
}

export function cagnotteRejectedEmail(data: CagnotteEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">❌</div>
      </div>
      <h1 class="title" style="text-align: center;">Cagnotte refusee</h1>
      <p class="text" style="text-align: center;">
        Bonjour <strong style="color: #ffffff;">${data.organizerName}</strong>,<br><br>
        Nous sommes desoles, votre cagnotte <strong style="color: #f97316;">"${data.cagnotteTitle}"</strong> n'a pas ete validee.
      </p>
      
      ${data.reason ? `
      <div class="warning-box">
        <p style="color: #fca5a5; font-weight: 700; margin: 0 0 8px 0;">Raison du refus :</p>
        <p class="warning-text">${data.reason}</p>
      </div>
      ` : ''}
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Que faire maintenant ?</p>
        <p class="text" style="margin: 8px 0;">📝 Vous pouvez creer une nouvelle cagnotte en corrigeant les problemes mentionnes</p>
        <p class="text" style="margin: 8px 0;">💬 Contactez notre support si vous avez des questions</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/contact" class="button">Contacter le support</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits reserves.</p>
    </div>
  `;
  
  return {
    subject: '❌ Cagnotte refusee - ' + data.cagnotteTitle,
    html: wrapHtml(content)
  };
}

export function cagnotteDocumentsRequestedEmail(data: CagnotteEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">📄</div>
      </div>
      <h1 class="title" style="text-align: center;">Documents requis</h1>
      <p class="text" style="text-align: center;">
        Bonjour <strong style="color: #ffffff;">${data.organizerName}</strong>,<br><br>
        Votre cagnotte <strong style="color: #f97316;">"${data.cagnotteTitle}"</strong> necessite des documents supplementaires pour etre validee.
      </p>
      
      ${data.reason ? `
      <div class="highlight-box">
        <p style="color: #a1a1aa; font-weight: 700; margin: 0 0 8px 0;">Documents demandes :</p>
        <p style="color: #ffffff; margin: 0;">${data.reason}</p>
      </div>
      ` : ''}
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Comment proceder :</p>
        <p class="text" style="margin: 8px 0;">1. Connectez-vous a votre espace organisateur</p>
        <p class="text" style="margin: 8px 0;">2. Accedez a votre cagnotte</p>
        <p class="text" style="margin: 8px 0;">3. Ajoutez les documents demandes</p>
        <p class="text" style="margin: 8px 0;">4. Soumettez a nouveau pour validation</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/organizer/cagnottes" class="button">Ajouter les documents</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits reserves.</p>
    </div>
  `;
  
  return {
    subject: '📄 Documents requis pour votre cagnotte - ' + data.cagnotteTitle,
    html: wrapHtml(content)
  };
}

interface CagnottePayoutEmailData {
  cagnotteTitle: string;
  organizerName: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
}

export function cagnottePayoutEmail(data: CagnottePayoutEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">💰</div>
      </div>
      <h1 class="title" style="text-align: center;">Versement effectue !</h1>
      <p class="text" style="text-align: center;">
        Felicitations <strong style="color: #ffffff;">${data.organizerName}</strong>,<br><br>
        Le versement de votre cagnotte <strong style="color: #f97316;">"${data.cagnotteTitle}"</strong> a ete effectue avec succes !
      </p>
      
      <div class="info-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Montant verse</span><br>
              <span style="color: #22c55e; font-weight: 900; font-size: 24px;">${data.amount.toLocaleString('fr-FR')} F CFA</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #71717a; font-size: 13px;">Methode de paiement</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.paymentMethod}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #71717a; font-size: 13px;">Numero de recu</span><br>
              <span style="color: #ffffff; font-weight: 700;">${data.receiptNumber}</span>
            </td>
          </tr>
        </table>
      </div>
      
      <p class="text" style="text-align: center; font-size: 13px;">
        Un recu PDF est disponible dans votre espace organisateur.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/organizer/wallet" class="button">Voir mon portefeuille</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits reserves.</p>
      <p class="footer-text">Merci de votre confiance !</p>
    </div>
  `;
  
  return {
    subject: '💰 Versement effectue - ' + data.cagnotteTitle,
    html: wrapHtml(content)
  };
}

export function organizerWelcomeEmail(userName: string, companyName?: string): { subject: string; html: string } {
  const content = `
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="success-icon">🚀</div>
      </div>
      <h1 class="title" style="text-align: center;">Bienvenue dans l'Espace Pro !</h1>
      <p class="text" style="text-align: center;">
        Félicitations <strong style="color: #ffffff;">${companyName || userName}</strong> !<br><br>
        Ton compte organisateur est maintenant actif. Tu peux commencer à publier tes événements sur TIKEZONE.
      </p>
      
      <div class="info-card">
        <p style="color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">Tes avantages Pro :</p>
        <p class="text" style="margin: 8px 0;">📊 Dashboard complet avec statistiques</p>
        <p class="text" style="margin: 8px 0;">🎟️ Création illimitée d'événements</p>
        <p class="text" style="margin: 8px 0;">💰 Gestion des paiements et virements</p>
        <p class="text" style="margin: 8px 0;">📱 Scanner QR pour valider les entrées</p>
        <p class="text" style="margin: 8px 0;">🔗 Liens personnalisés pour tes événements</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://tikezone.com/publish" class="button">Créer mon premier événement</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} TIKEZONE. Tous droits réservés.</p>
      <p class="footer-text">Conçu avec passion pour sublimer vos événements</p>
    </div>
  `;
  
  return {
    subject: '🚀 Bienvenue dans l\'Espace Pro TIKEZONE !',
    html: wrapHtml(content)
  };
}
