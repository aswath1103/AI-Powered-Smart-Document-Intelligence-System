import { DocumentData, DocumentChunk } from '../types';

// Helper to generate vector previews and chunk documents
export function createChunksFromText(docId: string, pages: { pageNumber: number; sections: { id: string; heading: string; text: string; page: number }[] }[]): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 1;

  for (const page of pages) {
    for (const sec of page.sections) {
      // Create a deterministic pseudo-embedding preview for visualization
      const textHash = sec.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const embeddingPreview = Array.from({ length: 8 }, (_, i) => {
        const val = Math.sin(textHash * (i + 1)) * 0.5 + 0.5;
        return Number(val.toFixed(4));
      });

      chunks.push({
        chunkId: `chunk-${docId}-${chunkIndex++}`,
        docId,
        pageNumber: page.pageNumber,
        sectionTitle: sec.heading,
        content: sec.text,
        embeddingPreview,
        tokenCount: Math.round(sec.text.split(/\s+/).length * 1.3),
      });
    }
  }

  return chunks;
}

export const sampleDocuments: DocumentData[] = [
  {
    id: 'doc-admission-2026',
    title: 'University Official Admission Notice & Fellowship Offer',
    category: 'Education / Admissions',
    uploadDate: '2026-10-01',
    fileSize: '480 KB',
    rawContent: `OFFICIAL NOTIFICATION OF ADMISSION & NEED-BASED FELLOWSHIP
St. Jude Institute of Advanced Technologies — Admissions Directorate
Academic Year 2026–2027

Page 1 - Section 1: Offer of Admission & Major Program
Congratulations! The Admissions Board is pleased to offer you provisional admission to the Master of Science in Artificial Intelligence Systems for the upcoming Fall Semester. Your student registration number is SJI-98421. Acceptance of this offer is contingent upon full satisfaction of all financial verification criteria and submission of prerequisite credential files.

Page 1 - Section 2: Financial Verification & Income Certificate Requirements
You have been tentatively selected for the Dean's Merit & Need Fellowship, providing a 60% tuition waiver ($18,400 per annum). To formalize this grant, you must prepare and upload a certified Income Certificate issued by a competent revenue authority (dated within the past 6 months), along with the previous fiscal year's tax filing returns. The strict submission deadline for the income certificate and financial verification dossier is October 15, 2026 at 11:59 PM EST. Failure to submit before this deadline will result in automatic revocation of the fellowship grant and reassessment at full non-subsidized tuition.

Page 2 - Section 3: Non-Refundable Enrollment Deposit
To guarantee your seat in the matriculated cohort, you must remit an Enrollment Confirmation Deposit of $500.00 USD. This fee must be paid via the University Student Portal by November 1, 2026. This deposit is strictly non-refundable under all circumstances, though it will be credited directly against your Semester 1 student activity and lab fees upon final orientation registration.

Page 2 - Section 4: On-Campus Housing Priority & Room Reservation
On-campus graduate residential units are allocated strictly in order of completed application receipt. To qualify for subsidized graduate campus housing (Room & Board: $1,250/month), you must complete the Residential Preference Form and submit a $250.00 Housing Security Deposit no later than November 15, 2026. Applications received after November 15 will be placed on the unassisted waitlist.

Page 3 - Section 5: Mandatory Medical Immunization & Health Clearance
All enrolled graduate candidates must provide comprehensive immunization records, including documented proof of MMR (Measles, Mumps, Rubella), Hepatitis B titer clearance, and a certified Tuberculosis skin or blood test completed within ninety (90) days prior to campus arrival. Health records must be approved by University Health Services before December 1, 2026. Failure to secure clearance will result in an administrative registration hold prohibiting attendance at course lectures.`,
    pages: [
      {
        pageNumber: 1,
        sections: [
          {
            id: 'sec-1-1',
            heading: 'Offer of Admission & Major Program',
            page: 1,
            text: 'Congratulations! The Admissions Board is pleased to offer you provisional admission to the Master of Science in Artificial Intelligence Systems for the upcoming Fall Semester. Your student registration number is SJI-98421. Acceptance of this offer is contingent upon full satisfaction of all financial verification criteria and submission of prerequisite credential files.',
          },
          {
            id: 'sec-1-2',
            heading: 'Financial Verification & Income Certificate Requirements',
            page: 1,
            text: "You have been tentatively selected for the Dean's Merit & Need Fellowship, providing a 60% tuition waiver ($18,400 per annum). To formalize this grant, you must prepare and upload a certified Income Certificate issued by a competent revenue authority (dated within the past 6 months), along with the previous fiscal year's tax filing returns. The strict submission deadline for the income certificate and financial verification dossier is October 15, 2026 at 11:59 PM EST. Failure to submit before this deadline will result in automatic revocation of the fellowship grant and reassessment at full non-subsidized tuition.",
          },
        ],
      },
      {
        pageNumber: 2,
        sections: [
          {
            id: 'sec-2-1',
            heading: 'Non-Refundable Enrollment Deposit',
            page: 2,
            text: 'To guarantee your seat in the matriculated cohort, you must remit an Enrollment Confirmation Deposit of $500.00 USD. This fee must be paid via the University Student Portal by November 1, 2026. This deposit is strictly non-refundable under all circumstances, though it will be credited directly against your Semester 1 student activity and lab fees upon final orientation registration.',
          },
          {
            id: 'sec-2-2',
            heading: 'On-Campus Housing Priority & Room Reservation',
            page: 2,
            text: 'On-campus graduate residential units are allocated strictly in order of completed application receipt. To qualify for subsidized graduate campus housing (Room & Board: $1,250/month), you must complete the Residential Preference Form and submit a $250.00 Housing Security Deposit no later than November 15, 2026. Applications received after November 15 will be placed on the unassisted waitlist.',
          },
        ],
      },
      {
        pageNumber: 3,
        sections: [
          {
            id: 'sec-3-1',
            heading: 'Mandatory Medical Immunization & Health Clearance',
            page: 3,
            text: 'All enrolled graduate candidates must provide comprehensive immunization records, including documented proof of MMR (Measles, Mumps, Rubella), Hepatitis B titer clearance, and a certified Tuberculosis skin or blood test completed within ninety (90) days prior to campus arrival. Health records must be approved by University Health Services before December 1, 2026. Failure to secure clearance will result in an administrative registration hold prohibiting attendance at course lectures.',
          },
        ],
      },
    ],
    chunks: [],
    summary:
      'Provisional admission offer to the Master of Science in AI Systems at St. Jude Institute, with a conditional 60% tuition fellowship ($18,400 value). Admission and funding are strictly contingent on time-sensitive financial and medical documentation.',
    proactiveAlerts: {
      deadlines: [
        {
          title: 'Income Certificate Submission Deadline',
          valueOrDate: 'October 15, 2026 (11:59 PM EST)',
          whyItMatters: 'Failure to submit certified income documents by this cutoff results in permanent cancellation of your $18,400 fellowship grant.',
          citation: 'Page 1, Section 2',
        },
        {
          title: 'Seat Confirmation Deposit Cutoff',
          valueOrDate: 'November 1, 2026',
          whyItMatters: 'Secures your matriculation status; your admission seat will be offered to waitlisted candidates if missed.',
          citation: 'Page 2, Section 3',
        },
        {
          title: 'Medical Health Clearance Approval',
          valueOrDate: 'December 1, 2026',
          whyItMatters: 'Mandatory for physical class enrollment; missing clearance triggers an administrative registration lock.',
          citation: 'Page 3, Section 5',
        },
      ],
      financials: [
        {
          title: 'Dean’s Fellowship Tuition Waiver',
          valueOrDate: '$18,400 per annum (60% waiver)',
          whyItMatters: 'Substantial cost offset requiring active compliance with income verification guidelines.',
          citation: 'Page 1, Section 2',
        },
        {
          title: 'Non-Refundable Enrollment Deposit',
          valueOrDate: '$500.00 USD',
          whyItMatters: 'Forfeited if you decide not to matriculate, though credited to lab fees upon enrollment.',
          citation: 'Page 2, Section 3',
        },
        {
          title: 'Graduate Housing Security Deposit',
          valueOrDate: '$250.00 USD (plus $1,250/mo)',
          whyItMatters: 'Required upfront to reserve priority university-subsidized graduate accommodation.',
          citation: 'Page 2, Section 4',
        },
      ],
      requirements: [
        {
          title: 'Certified Income Certificate & Tax Returns',
          criteria: 'Issued by competent revenue authority within last 6 months + past year tax return',
          whyItMatters: 'Statutory verification proving eligibility for need-based tuition subsidy.',
          citation: 'Page 1, Section 2',
        },
        {
          title: 'Comprehensive Immunization Dossier',
          criteria: 'MMR, Hepatitis B titer, TB clearance within 90 days',
          whyItMatters: 'State health compliance mandate for on-campus lecture halls.',
          citation: 'Page 3, Section 5',
        },
        {
          title: 'Residential Preference Form',
          criteria: 'Completed online submission before waitlist trigger',
          whyItMatters: 'Ensures room assignment before general campus housing fills up.',
          citation: 'Page 2, Section 4',
        },
      ],
    },
    actions: [
      {
        id: 'act-1',
        title: 'Prepare & Obtain Certified Income Certificate',
        description: 'Procure official income certificate from local revenue authority dated within the last 6 months and gather prior year tax returns.',
        deadline: 'October 15, 2026',
        requiredDocuments: ['Income Certificate (< 6 mos)', 'Previous Year Tax Filing'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 1, Section 2',
      },
      {
        id: 'act-2',
        title: 'Upload Financial Verification Dossier to Portal',
        description: 'Submit all verified income documents through the Admissions Portal before 11:59 PM EST cutoff.',
        deadline: 'October 15, 2026',
        requiredDocuments: ['Admissions Portal Credentials'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 1, Section 2',
      },
      {
        id: 'act-3',
        title: 'Pay Non-Refundable Enrollment Deposit',
        description: 'Remit $500.00 USD confirmation deposit to lock in your class seat.',
        deadline: 'November 1, 2026',
        requiredDocuments: ['Credit Card / Wire Receipt'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 2, Section 3',
      },
      {
        id: 'act-4',
        title: 'Submit Housing Preference & $250 Deposit',
        description: 'Complete the graduate residential form and submit $250 security deposit for campus room allocation.',
        deadline: 'November 15, 2026',
        requiredDocuments: ['Residential Preference Form'],
        priority: 'medium',
        completed: false,
        sourceCitation: 'Page 2, Section 4',
      },
      {
        id: 'act-5',
        title: 'Schedule Health Check & Submit Immunizations',
        description: 'Undergo TB testing and compile MMR/Hepatitis B immunization records for University Health clearance.',
        deadline: 'December 1, 2026',
        requiredDocuments: ['TB Skin/Blood Test', 'MMR Record', 'Hep B Titer'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 3, Section 5',
      },
    ],
    healthAudit: {
      healthScore: 84,
      riskLevel: 'Moderate Risk',
      summary: 'Well-structured admission notice with precise deadlines. Attention is required regarding non-refundable deposit terms and tight verification turnarounds.',
      missingFields: [
        {
          field: 'Orientation Schedule & Preregistration Date',
          consequence: 'No specific date is listed for physical orientation or course registration.',
          recommendation: 'Contact admissions officer to confirm arrival week.',
        },
      ],
      riskFlags: [
        {
          title: 'Irrevocable Forfeiture of $18,400 Grant',
          section: 'Section 2',
          severity: 'alert',
          cautionaryExplanation: 'This section may require your attention because missing October 15 results in immediate cancellation of the 60% fellowship with no grace period mentioned.',
          citation: 'Page 1, Section 2',
        },
        {
          title: 'Non-Refundable $500 Deposit',
          section: 'Section 3',
          severity: 'caution',
          cautionaryExplanation: 'This section may require your attention because the $500 deposit is explicitly non-refundable even if your visa or circumstance changes.',
          citation: 'Page 2, Section 3',
        },
      ],
      conflictingClauses: [],
    },
  },
  {
    id: 'doc-lease-nnn',
    title: 'Commercial Triple Net (NNN) Master Lease Agreement',
    category: 'Legal / Lease',
    uploadDate: '2026-09-24',
    fileSize: '1.2 MB',
    rawContent: `COMMERCIAL REAL ESTATE TRIPLE NET (NNN) LEASE AGREEMENT
Apex Commercial Holdings LLC (Landlord) & Lumina Design Studio Inc. (Tenant)
Premises: Suite 400, 750 Horizon Boulevard, Austin, TX

Page 1 - Section 1: Demised Premises & Initial Term
The Landlord leases to Tenant the commercial office space comprising approximately 4,200 rentable square feet for an initial lease term of sixty (60) months, commencing on November 1, 2026 and expiring October 31, 2031.

Page 2 - Section 2: Base Rent, NNN Operational Expenses & Late Charges
Tenant shall pay Base Rent of $12,500.00 per month, due in advance on the 1st day of each calendar month. In addition to Base Rent, this is a true Triple Net (NNN) lease; Tenant is liable for its proportionate share (14.2%) of real estate taxes, building hazard insurance, and common area maintenance (CAM). Any rent unpaid by the 5th day incurs a late surcharge of 5% ($625.00) plus 1.5% interest per month thereafter.

Page 3 - Section 3: Security Deposit & Letter of Credit
Upon execution, Tenant shall deposit $25,000.00 (two months Base Rent) as a Security Deposit. Landlord holds the deposit in an unsegregated account and may commingle funds. No interest shall accrue for Tenant.

Page 4 - Section 4: Alterations, Surrender & Mandatory Restoration Penalty
Tenant shall not perform structural alterations without prior written consent. Upon termination or expiration of the lease, Tenant shall surrender the premises in original "warm shell" condition. If Tenant fails to complete full de-identification and restoration within 10 business days post-lease expiry, Landlord may perform the restoration and assess Tenant a Restoration Penalty equal to actual contractor costs plus an administrative fee of 20%, along with holdover rent at 200% of the normal monthly rate.

Page 5 - Section 5: Notice of Non-Renewal or Early Termination
Tenant possesses no right to early termination during the initial 60-month term. Any option to renew for a secondary 36-month term requires formal written notice via certified courier at least one hundred eighty (180) days prior to lease expiration (no later than May 4, 2031).`,
    pages: [
      {
        pageNumber: 1,
        sections: [
          {
            id: 'lease-1-1',
            heading: 'Demised Premises & Initial Term',
            page: 1,
            text: 'The Landlord leases to Tenant the commercial office space comprising approximately 4,200 rentable square feet for an initial lease term of sixty (60) months, commencing on November 1, 2026 and expiring October 31, 2031.',
          },
        ],
      },
      {
        pageNumber: 2,
        sections: [
          {
            id: 'lease-2-1',
            heading: 'Base Rent, NNN Operational Expenses & Late Charges',
            page: 2,
            text: 'Tenant shall pay Base Rent of $12,500.00 per month, due in advance on the 1st day of each calendar month. In addition to Base Rent, this is a true Triple Net (NNN) lease; Tenant is liable for its proportionate share (14.2%) of real estate taxes, building hazard insurance, and common area maintenance (CAM). Any rent unpaid by the 5th day incurs a late surcharge of 5% ($625.00) plus 1.5% interest per month thereafter.',
          },
        ],
      },
      {
        pageNumber: 3,
        sections: [
          {
            id: 'lease-3-1',
            heading: 'Security Deposit & Letter of Credit',
            page: 3,
            text: 'Upon execution, Tenant shall deposit $25,000.00 (two months Base Rent) as a Security Deposit. Landlord holds the deposit in an unsegregated account and may commingle funds. No interest shall accrue for Tenant.',
          },
        ],
      },
      {
        pageNumber: 4,
        sections: [
          {
            id: 'lease-4-1',
            heading: 'Alterations, Surrender & Mandatory Restoration Penalty',
            page: 4,
            text: 'Tenant shall not perform structural alterations without prior written consent. Upon termination or expiration of the lease, Tenant shall surrender the premises in original "warm shell" condition. If Tenant fails to complete full de-identification and restoration within 10 business days post-lease expiry, Landlord may perform the restoration and assess Tenant a Restoration Penalty equal to actual contractor costs plus an administrative fee of 20%, along with holdover rent at 200% of the normal monthly rate.',
          },
        ],
      },
      {
        pageNumber: 5,
        sections: [
          {
            id: 'lease-5-1',
            heading: 'Notice of Non-Renewal or Early Termination',
            page: 5,
            text: 'Tenant possesses no right to early termination during the initial 60-month term. Any option to renew for a secondary 36-month term requires formal written notice via certified courier at least one hundred eighty (180) days prior to lease expiration (no later than May 4, 2031).',
          },
        ],
      },
    ],
    chunks: [],
    summary:
      'A 5-year commercial Triple Net (NNN) lease for 4,200 sq ft office space at $12,500/month plus 14.2% CAM/taxes. Contains strict surrender restoration obligations and a 200% holdover rent clause.',
    proactiveAlerts: {
      deadlines: [
        {
          title: 'Monthly Rent & CAM Payment Due',
          valueOrDate: '1st of every calendar month (Grace period ends 5th)',
          whyItMatters: 'Payments after the 5th incur an immediate 5% ($625) penalty plus 1.5% ongoing interest.',
          citation: 'Page 2, Section 2',
        },
        {
          title: 'Lease Commencement & Possession',
          valueOrDate: 'November 1, 2026',
          whyItMatters: 'Keys handover and start of financial occupancy liability.',
          citation: 'Page 1, Section 1',
        },
        {
          title: 'Mandatory 180-Day Renewal Notice Window',
          valueOrDate: 'May 4, 2031 (180 days before Oct 31, 2031)',
          whyItMatters: 'Failure to give written notice forfeits your right to renew the office space.',
          citation: 'Page 5, Section 5',
        },
      ],
      financials: [
        {
          title: 'Base Monthly Rent',
          valueOrDate: '$12,500.00 / month',
          whyItMatters: 'Core recurring liability totaling $150,000 annually excluding taxes and utilities.',
          citation: 'Page 2, Section 2',
        },
        {
          title: 'Upfront Security Deposit',
          valueOrDate: '$25,000.00 USD',
          whyItMatters: 'Tied up for the full 60 months without earning interest.',
          citation: 'Page 3, Section 3',
        },
        {
          title: 'Liquidated Restoration Penalty & 200% Holdover',
          valueOrDate: 'Actual Costs + 20% surcharge, 200% rent ($25k/mo)',
          whyItMatters: 'Severe financial penalty if space is not vacated in exact warm-shell condition.',
          citation: 'Page 4, Section 4',
        },
      ],
      requirements: [
        {
          title: 'Triple Net Pro-Rata Payment (14.2%)',
          criteria: 'Pay monthly estimate of property taxes, building insurance & CAM maintenance',
          whyItMatters: 'Variable operational expenditure that can increase annually.',
          citation: 'Page 2, Section 2',
        },
        {
          title: 'Warm Shell Restoration & De-identification',
          criteria: 'Restore premises within 10 business days of expiry',
          whyItMatters: 'Prevents landlord from hiring contractors at your expense with a 20% mark-up.',
          citation: 'Page 4, Section 4',
        },
        {
          title: 'Certified Courier for Renewal Notice',
          criteria: 'Written physical courier, not email or verbal',
          whyItMatters: 'Strict legal clause; electronic emails will not be legally binding.',
          citation: 'Page 5, Section 5',
        },
      ],
    },
    actions: [
      {
        id: 'lease-act-1',
        title: 'Wire Security Deposit ($25,000)',
        description: 'Transfer 2 months base rent security deposit to Landlord escrow prior to move-in.',
        deadline: 'October 25, 2026',
        requiredDocuments: ['Wire Transfer Confirmation'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 3, Section 3',
      },
      {
        id: 'lease-act-2',
        title: 'Obtain Commercial General Liability Certificate',
        description: 'Provide certificate of insurance naming Apex Commercial Holdings LLC as additional insured.',
        deadline: 'October 30, 2026',
        requiredDocuments: ['ACORD 25 Insurance Certificate'],
        priority: 'high',
        completed: false,
        sourceCitation: 'Page 2, Section 2',
      },
      {
        id: 'lease-act-3',
        title: 'Establish Recurring Rent Wire for 1st of Month',
        description: 'Set up auto-remittance for $12,500 base rent plus CAM to prevent the 5% late penalty.',
        deadline: 'November 1, 2026',
        requiredDocuments: ['Banking ACH Setup'],
        priority: 'medium',
        completed: false,
        sourceCitation: 'Page 2, Section 2',
      },
    ],
    healthAudit: {
      healthScore: 71,
      riskLevel: 'Elevated Risk',
      summary: 'Heavy tenant liability terms including unsegregated security deposit, harsh restoration penalties, and 200% holdover rent.',
      missingFields: [
        {
          field: 'CAM Audit Rights & Expense Cap',
          consequence: 'No cap on annual CAM increases and no explicit tenant audit procedure specified.',
          recommendation: 'Request a 5% controllable CAM cap and 60-day annual audit window.',
        },
      ],
      riskFlags: [
        {
          title: 'Hidden 20% Administrative Surcharge on Restoration',
          section: 'Section 4',
          severity: 'alert',
          cautionaryExplanation: 'This section may require your attention because if restoration is delayed by just 10 days, the Landlord can charge full repair fees plus a 20% markup.',
          citation: 'Page 4, Section 4',
        },
        {
          title: '200% Holdover Penalty Rate',
          section: 'Section 4',
          severity: 'alert',
          cautionaryExplanation: 'This section may require your attention because remaining past the lease end date doubles rent to $25,000/month.',
          citation: 'Page 4, Section 4',
        },
      ],
      conflictingClauses: [],
    },
  },
];

// Initialize chunks for sample documents
for (const doc of sampleDocuments) {
  doc.chunks = createChunksFromText(doc.id, doc.pages);
}
