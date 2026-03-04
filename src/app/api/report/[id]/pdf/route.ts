/**
 * GET /api/report/[id]/pdf
 *
 * Returns the compatibility report as a formatted HTML page suitable for
 * printing or saving as PDF via the browser's built-in print dialog.
 * Requires authentication; user must own the report.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Authentication required", { status: 401 });
    }

    const { id: reportId } = await params;

    if (!reportId) {
      return new Response("Report ID is required", { status: 400 });
    }

    const report = await prisma.compatibilityReport.findUnique({
      where: { id: reportId },
      include: {
        person1: {
          select: {
            name: true,
            birthDate: true,
            birthCity: true,
            birthCountry: true,
          },
        },
        person2: {
          select: {
            name: true,
            birthDate: true,
            birthCity: true,
            birthCountry: true,
          },
        },
      },
    });

    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    if (report.userId !== session.user.id) {
      return new Response("You do not have access to this report", {
        status: 403,
      });
    }

    // Parse sections from fullNarrative
    let sections: Record<string, string> = {};
    try {
      sections = JSON.parse(report.fullNarrative);
    } catch {
      sections = { fullText: report.fullNarrative };
    }

    // Map section keys to friendly titles
    const sectionLabels: Record<string, string> = {
      theBigPicture: "The Big Picture",
      emotionalLandscape: "Emotional Connection",
      passionAndAttraction: "Romance & Chemistry",
      communicationStyle: "Communication",
      longTermPotential: "Long-Term Potential",
      fullText: "Full Analysis",
    };

    // Build score color helper
    function scoreColor(score: number): string {
      if (score >= 70) return "#10B981";
      if (score >= 50) return "#F59E0B";
      return "#EF4444";
    }

    // Build score bar HTML
    function scoreBarHTML(label: string, score: number): string {
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid #F1F5F9;">
          <span style="width:120px;font-size:10pt;font-weight:500;color:#334155;">${label}</span>
          <span style="flex:1;height:10px;background:#F1F5F9;border-radius:5px;overflow:hidden;">
            <span style="display:block;height:100%;width:${score}%;background:${scoreColor(score)};border-radius:5px;"></span>
          </span>
          <span style="width:30px;text-align:right;font-size:10pt;font-weight:700;color:${scoreColor(score)};">${score}</span>
        </div>
      `;
    }

    // Build narrative sections HTML
    const sectionKeys = Object.keys(sections);
    const sectionsHTML = sectionKeys
      .map((key) => {
        const title = sectionLabels[key] || key.replace(/([A-Z])/g, " $1").trim();
        const content = sections[key];
        if (!content) return "";
        return `
          <div style="page-break-inside:avoid;margin-bottom:16pt;">
            <h3 style="font-family:Georgia,serif;font-size:13pt;font-weight:600;color:#0F172A;margin:0 0 8pt 0;padding-bottom:6pt;border-bottom:1px solid #E2E8F0;">
              ${title}
            </h3>
            <p style="font-size:10pt;line-height:1.7;color:#334155;margin:0;white-space:pre-line;">${escapeHTML(content)}</p>
          </div>
        `;
      })
      .join("");

    // Red flags
    const redFlagsHTML =
      Array.isArray(report.redFlags) && report.redFlags.length > 0
        ? `
          <div style="page-break-inside:avoid;margin-bottom:16pt;">
            <h3 style="font-family:Georgia,serif;font-size:13pt;font-weight:600;color:#EF4444;margin:0 0 8pt 0;padding-bottom:6pt;border-bottom:1px solid #FCA5A5;">
              Watch Out For
            </h3>
            <ol style="font-size:10pt;line-height:1.7;color:#334155;margin:0;padding-left:20pt;">
              ${(report.redFlags as string[]).map((f) => `<li style="margin-bottom:6pt;">${escapeHTML(f)}</li>`).join("")}
            </ol>
          </div>
        `
        : "";

    // Growth areas
    const growthAreasHTML =
      Array.isArray(report.growthAreas) && report.growthAreas.length > 0
        ? `
          <div style="page-break-inside:avoid;margin-bottom:16pt;">
            <h3 style="font-family:Georgia,serif;font-size:13pt;font-weight:600;color:#10B981;margin:0 0 8pt 0;padding-bottom:6pt;border-bottom:1px solid #6EE7B7;">
              Your Growth Edge
            </h3>
            <ol style="font-size:10pt;line-height:1.7;color:#334155;margin:0;padding-left:20pt;">
              ${(report.growthAreas as string[]).map((g) => `<li style="margin-bottom:6pt;">${escapeHTML(g)}</li>`).join("")}
            </ol>
          </div>
        `
        : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(report.person1.name)} & ${escapeHTML(report.person2.name)} — Compatibility Report | ChartChemistry</title>
  <style>
    @page {
      margin: 0.75in 1in;
      size: letter;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: white;
      margin: 0;
      padding: 40px;
      font-size: 10pt;
      line-height: 1.6;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    .brand {
      text-align: center;
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 2px solid #7C3AED;
    }
    .brand-name {
      font-family: Georgia, serif;
      font-size: 24pt;
      font-weight: 700;
      color: #7C3AED;
    }
    .brand-sub {
      font-size: 9pt;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 4px;
    }
    .names {
      text-align: center;
      margin: 24pt 0 16pt;
    }
    .names h1 {
      font-family: Georgia, serif;
      font-size: 22pt;
      font-weight: 700;
      margin: 0;
    }
    .names .amp {
      color: #7C3AED;
    }
    .names .subtitle {
      font-size: 10pt;
      color: #64748B;
      margin-top: 4pt;
    }
    .overall-score {
      text-align: center;
      margin: 20pt 0;
      padding: 16pt;
      border: 1px solid #E2E8F0;
      border-radius: 8pt;
    }
    .overall-score .number {
      font-size: 40pt;
      font-weight: 700;
    }
    .overall-score .label {
      font-size: 9pt;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .scores-section {
      margin: 16pt 0 24pt;
      padding: 16pt;
      border: 1px solid #E2E8F0;
      border-radius: 8pt;
    }
    .scores-title {
      font-family: Georgia, serif;
      font-size: 10pt;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 10pt;
    }
    .summary-section {
      margin: 20pt 0;
      page-break-inside: avoid;
    }
    .summary-section h3 {
      font-family: Georgia, serif;
      font-size: 13pt;
      font-weight: 600;
      color: #0F172A;
      margin: 0 0 8pt 0;
      padding-bottom: 6pt;
      border-bottom: 1px solid #E2E8F0;
    }
    .summary-section p {
      font-size: 10pt;
      line-height: 1.7;
      color: #334155;
      margin: 0;
      white-space: pre-line;
    }
    .person-info {
      display: flex;
      justify-content: center;
      gap: 40pt;
      margin: 16pt 0;
      font-size: 9pt;
      color: #64748B;
    }
    .person-info div {
      text-align: center;
    }
    .person-info strong {
      color: #0F172A;
      font-size: 10pt;
    }
    .footer {
      text-align: center;
      margin-top: 32pt;
      padding-top: 16pt;
      border-top: 1px solid #E2E8F0;
      font-size: 8pt;
      color: #94A3B8;
    }
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 10px 28px;
      background: #7C3AED;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #5B21B6;
    }
    @media print {
      .print-btn { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-name">&#x2728; ChartChemistry</div>
      <div class="brand-sub">AI-Powered Astrological Compatibility Report</div>
    </div>

    <div class="names">
      <h1>${escapeHTML(report.person1.name)} <span class="amp">&</span> ${escapeHTML(report.person2.name)}</h1>
      <div class="subtitle">Compatibility Report &bull; ${report.tier} Tier</div>
    </div>

    <div class="person-info">
      <div>
        <strong>${escapeHTML(report.person1.name)}</strong><br/>
        ${report.person1.birthDate.toISOString().split("T")[0]}<br/>
        ${escapeHTML(report.person1.birthCity)}${report.person1.birthCountry ? ", " + escapeHTML(report.person1.birthCountry) : ""}
      </div>
      <div>
        <strong>${escapeHTML(report.person2.name)}</strong><br/>
        ${report.person2.birthDate.toISOString().split("T")[0]}<br/>
        ${escapeHTML(report.person2.birthCity)}${report.person2.birthCountry ? ", " + escapeHTML(report.person2.birthCountry) : ""}
      </div>
    </div>

    <div class="overall-score">
      <div class="number" style="color:${scoreColor(report.overallScore)};">${report.overallScore}</div>
      <div class="label">Overall Compatibility Score</div>
    </div>

    <div class="scores-section">
      <div class="scores-title">Dimension Scores</div>
      ${scoreBarHTML("Communication", report.communicationScore)}
      ${scoreBarHTML("Emotional", report.emotionalScore)}
      ${scoreBarHTML("Chemistry", report.chemistryScore)}
      ${scoreBarHTML("Stability", report.stabilityScore)}
      ${scoreBarHTML("Conflict", report.conflictScore)}
    </div>

    ${report.summaryNarrative ? `
    <div class="summary-section">
      <h3>The Big Picture</h3>
      <p>${escapeHTML(report.summaryNarrative)}</p>
    </div>
    ` : ""}

    ${sectionsHTML}
    ${redFlagsHTML}
    ${growthAreasHTML}

    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

    <div class="footer">
      <p>Generated by ChartChemistry &mdash; chartchemistry.io</p>
      <p>Report ID: ${escapeHTML(reportId)} &bull; Generated ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[GET /api/report/[id]/pdf] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/** Escape HTML special characters to prevent XSS */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
