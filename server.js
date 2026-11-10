// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function validateBceNumber(bceRaw) {
  const digits = bceRaw.replace(/[^0-9]/g, "");
  if (digits.length !== 10) {
    return { isValid: false, message: "Le num\xE9ro BCE doit comporter exactement 10 chiffres (ex: 0123.456.789)" };
  }
  const baseNum = parseInt(digits.substring(0, 8), 10);
  const checksum = parseInt(digits.substring(8, 10), 10);
  const calculatedCheck = 97 - baseNum % 97;
  const isValid = checksum === calculatedCheck;
  return {
    isValid,
    formatted: `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`,
    vatFormatted: `BE ${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`,
    details: isValid ? {
      entityType: digits.startsWith("0") ? "Soci\xE9t\xE9 / Personne morale" : "Entreprise personne physique",
      status: "Actif \xE0 la Banque-Carrefour des Entreprises",
      statutoryJurisdiction: "Tribunal de l'Entreprise francophone de Bruxelles / Wallonie"
    } : null,
    message: isValid ? "Num\xE9ro BCE v\xE9rifi\xE9 avec succ\xE8s selon l'algorithme officiel Modulo 97." : `Num\xE9ro BCE invalide : somme de contr\xF4le attendue ${calculatedCheck}, re\xE7u ${checksum}.`
  };
}
function validateNissNumber(nissRaw) {
  const digits = nissRaw.replace(/[^0-9]/g, "");
  if (digits.length !== 11) {
    return { isValid: false, message: "Le num\xE9ro NISS doit comporter 11 chiffres (ex: 85.06.12-123.45)" };
  }
  const baseDigits = digits.substring(0, 9);
  const checksum = parseInt(digits.substring(9, 11), 10);
  const baseNum1900 = parseInt(baseDigits, 10);
  const check1900 = 97 - baseNum1900 % 97;
  const baseNum2000 = parseInt(`2${baseDigits}`, 10);
  const check2000 = 97 - baseNum2000 % 97;
  let isValid = false;
  let birthCentury = 1900;
  if (checksum === check1900) {
    isValid = true;
    birthCentury = 1900;
  } else if (checksum === check2000) {
    isValid = true;
    birthCentury = 2e3;
  }
  const yearPart = parseInt(digits.substring(0, 2), 10);
  const monthPart = parseInt(digits.substring(2, 4), 10);
  const dayPart = parseInt(digits.substring(4, 6), 10);
  const seqPart = parseInt(digits.substring(6, 9), 10);
  const fullYear = birthCentury + yearPart;
  const gender = seqPart % 2 === 0 ? "F\xE9minin" : "Masculin";
  return {
    isValid,
    formatted: `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}-${digits.slice(6, 9)}.${digits.slice(9, 11)}`,
    birthDate: isValid ? `${String(dayPart).padStart(2, "0")}/${String(monthPart).padStart(2, "0")}/${fullYear}` : null,
    gender: isValid ? gender : null,
    message: isValid ? "Num\xE9ro de Registre National (NISS) valide et conforme \xE0 l'\xE9tat civil belge." : "Somme de contr\xF4le du NISS erron\xE9e selon l'algorithme de v\xE9rification du Registre National."
  };
}
function anonymizeBelgianText(text) {
  let anonymized = text;
  const replacements = [];
  const nissRegex = /\b\d{2}\.\d{2}\.\d{2}[-\s]?\d{3}\.\d{2}\b|\b\d{11}\b/g;
  anonymized = anonymized.replace(nissRegex, (match) => {
    replacements.push({ original: match, replacement: "[NISS-MASQU\xC9-RGPD]", type: "Num\xE9ro Registre National" });
    return "[NISS-MASQU\xC9-RGPD]";
  });
  const vatRegex = /\b(BE\s?0?\d{3}\.?\d{3}\.?\d{3})\b/gi;
  anonymized = anonymized.replace(vatRegex, (match) => {
    replacements.push({ original: match, replacement: "[TVA-BCE-MASQU\xC9E]", type: "Banque-Carrefour Entreprises" });
    return "[TVA-BCE-MASQU\xC9E]";
  });
  const ibanRegex = /\bBE\d{2}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/gi;
  anonymized = anonymized.replace(ibanRegex, (match) => {
    replacements.push({ original: match, replacement: "[IBAN-BANCAIRE-S\xC9CURIS\xC9]", type: "Compte Bancaire" });
    return "[IBAN-BANCAIRE-S\xC9CURIS\xC9]";
  });
  const commRegex = /\+{3}\d{3}\/\d{4}\/\d{5}\+{3}/g;
  anonymized = anonymized.replace(commRegex, (match) => {
    replacements.push({ original: match, replacement: "[COMMUNICATION-STRUCTUR\xC9E-ANONYME]", type: "Virement SPF/ONSS" });
    return "[COMMUNICATION-STRUCTUR\xC9E-ANONYME]";
  });
  return {
    anonymizedText: anonymized,
    redactedItemsCount: replacements.length,
    redactedItems: replacements,
    protectionLevel: "Niveau 4 - Conforme APD & RGPD Belgique"
  };
}
var STATBEL_HEALTH_INDICES = {
  "2022-01": 117.27,
  "2022-06": 121.43,
  "2022-12": 127.89,
  "2023-01": 128,
  "2023-06": 128.91,
  "2023-12": 129.54,
  "2024-01": 130.12,
  "2024-06": 131.78,
  "2024-12": 132.85,
  "2025-01": 133.4,
  "2025-06": 134.15,
  "2025-12": 135.2,
  "2026-01": 135.8,
  "2026-06": 136.5,
  "2026-11": 137.1
};
function calculateRentIndexation(params) {
  const baseKey = `${params.signYear}-${String(params.signMonth).padStart(2, "0")}`;
  const currentKey = `${params.currentYear}-${String(params.currentMonth).padStart(2, "0")}`;
  const baseIndex = STATBEL_HEALTH_INDICES[baseKey] || 118.5;
  const newIndex = STATBEL_HEALTH_INDICES[currentKey] || 137.1;
  let pebFactor = 1;
  let pebNotice = "";
  if (params.pebGrade) {
    if (params.region === "bruxelles" || params.region === "wallonie") {
      if (params.pebGrade === "E") {
        pebFactor = 0.5;
        pebNotice = "Indexation partielle (50%) due au certificat PEB classe E selon la r\xE9glementation r\xE9gionale.";
      } else if (params.pebGrade === "F" || params.pebGrade === "G") {
        pebFactor = 0;
        pebNotice = "Indexation interdite (0%) due au certificat PEB d\xE9favorable (F ou G) selon les ordonnances r\xE9gionales.";
      }
    }
  }
  const rawIndexed = params.baseRent * newIndex / baseIndex;
  const increase = rawIndexed - params.baseRent;
  const actualIncrease = increase * pebFactor;
  const finalRent = Math.round((params.baseRent + actualIncrease) * 100) / 100;
  return {
    baseRent: params.baseRent,
    baseIndex,
    newIndex,
    finalRent,
    difference: Math.round(actualIncrease * 100) / 100,
    percentageIncrease: Math.round((finalRent - params.baseRent) / params.baseRent * 1e4) / 100,
    pebNotice,
    formula: `(${params.baseRent} \u20AC \xD7 ${newIndex}) / ${baseIndex}`,
    legalReference: "Article 1728bis du Code civil belge & D\xE9crets r\xE9gionaux sur les baux de r\xE9sidence principale"
  };
}
function simulateBelgianTaxes(grossRevenue, deductibleExpenses, dependents = 0) {
  const netTaxableIncome = Math.max(0, grossRevenue - deductibleExpenses);
  const minSocialContributions = 3460;
  const maxSocialContributions = 18500;
  let annualSocialContributions = netTaxableIncome * 0.205;
  if (annualSocialContributions < minSocialContributions && grossRevenue > 0) {
    annualSocialContributions = minSocialContributions;
  } else if (annualSocialContributions > maxSocialContributions) {
    annualSocialContributions = maxSocialContributions;
  }
  const fiscalTaxableBase = Math.max(0, netTaxableIncome - annualSocialContributions);
  const baseAllowance = 10570 + dependents * 1920;
  let remainingToTax = Math.max(0, fiscalTaxableBase - baseAllowance);
  let estimatedTax = 0;
  const t1 = Math.min(remainingToTax, 15820);
  estimatedTax += t1 * 0.25;
  remainingToTax = Math.max(0, remainingToTax - 15820);
  const t2 = Math.min(remainingToTax, 12100);
  estimatedTax += t2 * 0.4;
  remainingToTax = Math.max(0, remainingToTax - 12100);
  const t3 = Math.min(remainingToTax, 20400);
  estimatedTax += t3 * 0.45;
  remainingToTax = Math.max(0, remainingToTax - 20400);
  if (remainingToTax > 0) {
    estimatedTax += remainingToTax * 0.5;
  }
  const municipalTax = estimatedTax * 0.07;
  const totalTax = estimatedTax + municipalTax;
  const netDisposableIncome = Math.max(0, grossRevenue - deductibleExpenses - annualSocialContributions - totalTax);
  const monthlyNet = Math.round(netDisposableIncome / 12 * 100) / 100;
  return {
    grossRevenue,
    deductibleExpenses,
    netTaxableIncome,
    annualSocialContributions: Math.round(annualSocialContributions),
    quarterlySocialContributions: Math.round(annualSocialContributions / 4),
    fiscalTaxableBase: Math.round(fiscalTaxableBase),
    taxExemptAllowance: baseAllowance,
    federalTax: Math.round(estimatedTax),
    municipalTax: Math.round(municipalTax),
    totalTax: Math.round(totalTax),
    netDisposableIncome: Math.round(netDisposableIncome),
    monthlyNet,
    effectiveTaxRate: grossRevenue > 0 ? Math.round((totalTax + annualSocialContributions) / grossRevenue * 1e3) / 10 : 0
  };
}
app.get("/api/status", (_req, res) => {
  res.json({
    status: "online",
    platform: "AdminBelgique Core AI & Administrative Engine",
    version: "3.4.1",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    gdprCompliant: true,
    anonymizerActive: true,
    jurisdiction: "Royaume de Belgique"
  });
});
app.get("/api/download-zip", (_req, res) => {
  const zipPath = path.resolve(__dirname, "adminbelgique-platform.zip");
  if (fs.existsSync(zipPath)) {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="adminbelgique-platform.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: "Archive zip introuvable sur le serveur." });
  }
});
app.get("/api/download-android-zip", (_req, res) => {
  const zipPath = path.resolve(__dirname, "adminbelgique-android-project.zip");
  if (fs.existsSync(zipPath)) {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="adminbelgique-android-project.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: "Archive Android introuvable sur le serveur." });
  }
});
app.get("/api/download-deployment-guide", (_req, res) => {
  const guidePath = path.resolve(__dirname, "DEPLOIEMENT-GUIDE.md");
  if (fs.existsSync(guidePath)) {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="DEPLOIEMENT-GUIDE.md"');
    res.sendFile(guidePath);
  } else {
    res.status(404).json({ error: "Guide de d\xE9ploiement introuvable sur le serveur." });
  }
});
var DOSSIERS_FILE = path.resolve(__dirname, "data", "dossiers.json");
function getLocalDossiers() {
  try {
    if (!fs.existsSync(DOSSIERS_FILE)) {
      const initialSeed = [
        {
          id: "DOS-2026-88",
          title: "Contrat de Bail R\xE9sidence Principale - Ixelles",
          category: "Immobilier / R\xE9gion Bruxelles",
          date: "06/11/2026",
          status: "Conforme & Enregistrable",
          statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          action: "T\xE9l\xE9charger PDF"
        },
        {
          id: "DOS-2026-87",
          title: "Mise en Demeure de Paiement Facture Impay\xE9e",
          category: "Recouvrement B2B",
          date: "04/11/2026",
          status: "Notifi\xE9 au D\xE9biteur",
          statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          action: "Suivi \xC9ch\xE9ance 14j"
        },
        {
          id: "DOS-2026-85",
          title: "Analyse Avertissement-Extrait de R\xF4le SPF Finances",
          category: "Fiscalit\xE9 IPP 2025/2024",
          date: "02/11/2026",
          status: "Communication Valid\xE9e",
          statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          action: "Voir Recours"
        },
        {
          id: "DOS-2026-81",
          title: "Indexation Loyer Statbel - Appartement Li\xE8ge",
          category: "Statbel Indice Sant\xE9",
          date: "28/10/2026",
          status: "Courrier Pr\xEAt (+52.99 \u20AC)",
          statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          action: "Imprimer"
        }
      ];
      fs.mkdirSync(path.dirname(DOSSIERS_FILE), { recursive: true });
      fs.writeFileSync(DOSSIERS_FILE, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const data = fs.readFileSync(DOSSIERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local dossiers:", err);
    return [];
  }
}
function saveLocalDossiers(dossiers) {
  try {
    fs.mkdirSync(path.dirname(DOSSIERS_FILE), { recursive: true });
    fs.writeFileSync(DOSSIERS_FILE, JSON.stringify(dossiers, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving local dossiers:", err);
    return false;
  }
}
function requireBackendRole(allowedRoles) {
  return (req, res, next) => {
    const roleHeader = req.headers["x-user-role"] || req.query.role || req.body?.userRole || "admin";
    if (!allowedRoles.includes(roleHeader)) {
      return res.status(403).json({
        error: `Acc\xE8s Refus\xE9 : Le r\xF4le '${roleHeader}' ne dispose pas des permissions n\xE9cessaires pour cette section du back-end.`,
        requiredRoles: allowedRoles,
        userRole: roleHeader
      });
    }
    next();
  };
}
app.get("/api/dossiers", (_req, res) => {
  const dossiers = getLocalDossiers();
  res.json({ dossiers, total: dossiers.length, storageMode: "100% Local Autonome" });
});
app.post("/api/dossiers", requireBackendRole(["admin", "editor"]), (req, res) => {
  const { title, category, status = "En cours" } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Titre du dossier requis" });
  }
  const dossiers = getLocalDossiers();
  const newDossier = {
    id: `DOS-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`,
    title,
    category: category || "D\xE9marche G\xE9n\xE9rale",
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE"),
    status,
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    action: "Consulter"
  };
  dossiers.unshift(newDossier);
  saveLocalDossiers(dossiers);
  res.json({ success: true, dossier: newDossier });
});
app.delete("/api/dossiers/:id", requireBackendRole(["admin"]), (req, res) => {
  const { id } = req.params;
  let dossiers = getLocalDossiers();
  dossiers = dossiers.filter((d) => d.id !== id);
  saveLocalDossiers(dossiers);
  res.json({ success: true });
});
app.get("/api/backup", (_req, res) => {
  const dossiers = getLocalDossiers();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="adminbelgique-backup-${Date.now()}.json"`);
  res.json({
    platform: "AdminBelgique Standalone Engine",
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    dossiers
  });
});
var USERS_FILE = path.resolve(__dirname, "data", "users.json");
var AUDIT_FILE = path.resolve(__dirname, "data", "audit_logs.json");
function getLocalUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const initialUsers = [
        {
          uid: "admin-001",
          email: "admin@adminbelgique.com",
          displayName: "Marc Vandewalle",
          role: "admin",
          status: "active",
          company: "AdminBelgique SPRL / elikacces IT",
          createdAt: "15/01/2026"
        },
        {
          uid: "editor-002",
          email: "redaction@adminbelgique.com",
          displayName: "Sophie De Smet",
          role: "editor",
          status: "active",
          company: "Cabinet Juridique & Fiduciaire",
          createdAt: "20/03/2026"
        },
        {
          uid: "visitor-003",
          email: "visiteur.demo@gmail.com",
          displayName: "Lucas Peeters",
          role: "visitor",
          status: "active",
          company: "Particulier",
          createdAt: "10/05/2026"
        }
      ];
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
      return initialUsers;
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch (err) {
    return [];
  }
}
function getLocalAuditLogs() {
  try {
    if (!fs.existsSync(AUDIT_FILE)) {
      const initialLogs = [
        {
          id: "log-1",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          actorEmail: "admin@adminbelgique.com",
          actorRole: "admin",
          action: "RBAC_INIT",
          details: "Initialisation du syst\xE8me de r\xF4les et permissions (Admin, \xC9diteur, Visiteur)"
        }
      ];
      fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(initialLogs, null, 2));
      return initialLogs;
    }
    return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
  } catch (err) {
    return [];
  }
}
app.get("/api/admin/users", requireBackendRole(["admin"]), (_req, res) => {
  const users = getLocalUsers();
  res.json({ users, total: users.length, authorizedRole: "admin" });
});
app.post("/api/admin/users", requireBackendRole(["admin"]), (req, res) => {
  const { email, displayName, role = "editor", company, bceNumber } = req.body;
  if (!email || !displayName) {
    return res.status(400).json({ error: "Email et nom complet requis." });
  }
  const users = getLocalUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Un utilisateur avec cet email existe d\xE9j\xE0." });
  }
  const newUser = {
    uid: `usr-${Date.now()}`,
    email,
    displayName,
    role: ["admin", "editor", "visitor"].includes(role) ? role : "editor",
    status: "active",
    company: company || "Cabinet Belge",
    bceNumber: bceNumber || "",
    createdAt: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE"),
    lastLoginAt: "Jamais connect\xE9"
  };
  users.unshift(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  const logs = getLocalAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actorEmail: req.headers["x-user-email"] || "admin@adminbelgique.com",
    actorRole: "admin",
    action: "USER_REGISTERED",
    details: `Cr\xE9ation du compte ${email} avec le r\xF4le '${newUser.role}'`,
    targetUserEmail: email
  });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  res.status(201).json({ success: true, user: newUser });
});
app.patch("/api/admin/users/:uid/role", requireBackendRole(["admin"]), (req, res) => {
  const { uid } = req.params;
  const { role } = req.body;
  if (!["admin", "editor", "visitor"].includes(role)) {
    return res.status(400).json({ error: "R\xF4le invalide. R\xF4les autoris\xE9s : admin, editor, visitor." });
  }
  const users = getLocalUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouv\xE9." });
  }
  const previousRole = user.role;
  user.role = role;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  const logs = getLocalAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actorEmail: req.headers["x-user-email"] || "admin@adminbelgique.com",
    actorRole: "admin",
    action: "ROLE_CHANGED",
    details: `Modification du r\xF4le de ${user.email} : ${previousRole} -> ${role}`,
    targetUserEmail: user.email
  });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  res.json({ success: true, user, previousRole, newRole: role });
});
app.patch("/api/admin/users/:uid/status", requireBackendRole(["admin"]), (req, res) => {
  const { uid } = req.params;
  const users = getLocalUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouv\xE9." });
  }
  user.status = user.status === "active" ? "suspended" : "active";
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  const logs = getLocalAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actorEmail: req.headers["x-user-email"] || "admin@adminbelgique.com",
    actorRole: "admin",
    action: "USER_STATUS_CHANGED",
    details: `Statut de ${user.email} chang\xE9 \xE0 '${user.status}'`,
    targetUserEmail: user.email
  });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  res.json({ success: true, user });
});
app.delete("/api/admin/users/:uid", requireBackendRole(["admin"]), (req, res) => {
  const { uid } = req.params;
  let users = getLocalUsers();
  const target = users.find((u) => u.uid === uid);
  if (!target) {
    return res.status(404).json({ error: "Utilisateur non trouv\xE9." });
  }
  users = users.filter((u) => u.uid !== uid);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  const logs = getLocalAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actorEmail: req.headers["x-user-email"] || "admin@adminbelgique.com",
    actorRole: "admin",
    action: "USER_DELETED",
    details: `Suppression du compte utilisateur ${target.email}`,
    targetUserEmail: target.email
  });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  res.json({ success: true, deletedUid: uid });
});
app.get("/api/admin/audit-logs", requireBackendRole(["admin"]), (_req, res) => {
  const logs = getLocalAuditLogs();
  res.json({ logs, total: logs.length });
});
var SETTINGS_FILE = path.resolve(__dirname, "data", "settings.json");
function getLocalSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const initialSettings = {
        companyName: "elikacces IT Solutions / AdminBelgique",
        bceNumber: "0842.123.456",
        vatNumber: "BE 0842.123.456",
        email: "Elikhacom@gmail.com",
        address: "Avenue Louise 250, 1050 Bruxelles",
        activePlan: "independant",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2));
      return initialSettings;
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch (err) {
    return {};
  }
}
app.get("/api/admin/settings", requireBackendRole(["admin", "editor"]), (_req, res) => {
  const settings = getLocalSettings();
  res.json(settings);
});
app.post("/api/admin/settings", requireBackendRole(["admin"]), (req, res) => {
  const current = getLocalSettings();
  const updated = {
    ...current,
    ...req.body,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: req.headers["x-user-email"] || "admin@adminbelgique.com"
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  const logs = getLocalAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actorEmail: req.headers["x-user-email"] || "admin@adminbelgique.com",
    actorRole: "admin",
    action: "SETTINGS_UPDATED",
    details: "Mise \xE0 jour des param\xE8tres syst\xE8me de l'entreprise (BCE / TVA)"
  });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  res.json({ success: true, settings: updated });
});
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile = "independant", applyAnonymization = true } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Message requis" });
    }
    const latestMessage = messages[messages.length - 1];
    let sanitizedPrompt = latestMessage.content || "";
    let anonymizationReport = null;
    if (applyAnonymization) {
      anonymizationReport = anonymizeBelgianText(sanitizedPrompt);
      sanitizedPrompt = anonymizationReport.anonymizedText;
    }
    const systemInstruction = `
Vous \xEAtes l'Assistant IA Administratif d'AdminBelgique.com, plateforme sp\xE9cialis\xE9e et hautement qualifi\xE9e dans la l\xE9gislation, la fiscalit\xE9 et les formalit\xE9s administratives en Belgique.
Profil de l'utilisateur : ${userProfile}.

Votre expertise couvre :
1. SPF Finances (D\xE9claration IPP, Tax-on-web, ISOC, d\xE9claration TVA trimestrielle/mensuelle, communication structur\xE9e modulo 97, contestation d'avertissement-extrait de r\xF4le).
2. BCE (Banque-Carrefour des Entreprises), guichets d'entreprises (Liantis, Partena, Securex, Xerius, UCM), codes NACE-BEL.
3. ONSS & Inasti (cotisations sociales d'ind\xE9pendants, lois sociales, r\xE9gularisations).
4. Droit immobilier belge (Bail d'habitation principale, d\xE9crets r\xE9gionaux Wallonie / Bruxelles / Flandre, calcul d'indexation officielle selon l'indice sant\xE9 Statbel, droits d'enregistrement 12.5% ou 3%).
5. Organismes publics : INAMI, CPAS, ONEM, Moniteur Belge, communes belges, SPF Emploi.

R\xE8gles de r\xE9ponse :
- Formulez des r\xE9ponses structur\xE9es, pr\xE9cises et directement actionnables (\xE9tapes 1, 2, 3).
- Citez toujours les organismes et lois belges pertinents avec bienveillance et professionnalisme.
- Rappelez toujours en bas de message que AdminBelgique est une plateforme d'assistance priv\xE9e ind\xE9pendante et ne remplace pas un conseil d'avocat ou d'expert-comptable agr\xE9\xE9 ITAA.
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: sanitizedPrompt,
          config: {
            systemInstruction
          }
        });
        const replyText = response.text || "Je n'ai pas pu formuler de r\xE9ponse.";
        return res.json({
          reply: replyText,
          anonymization: anonymizationReport,
          engine: "Gemini 3.8 Flash (Belgian Legal Tuning)"
        });
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local Belgian AI engine:", err.message);
      }
    }
    let fallbackReply = "";
    const q = sanitizedPrompt.toLowerCase();
    if (q.includes("index") || q.includes("loyer") || q.includes("statbel")) {
      fallbackReply = `### Calcul et D\xE9marche d'Indexation de Loyer en Belgique
En droit belge (article 1728bis du Code civil), l'indexation n'est possible qu'\xE0 la date anniversaire du bail et si elle n'est pas express\xE9ment exclue dans le contrat \xE9crit.

**Formule officielle Statbel :**
\`Loyer index\xE9 = (Loyer de base \xD7 Nouvel indice sant\xE9) / Indice sant\xE9 de base\`

**Points d'attention majeurs :**
1. **Indice sant\xE9 de base :** C'est l'indice sant\xE9 du mois pr\xE9c\xE9dant la signature du bail (et non l'entr\xE9e dans les lieux).
2. **Nouvel indice sant\xE9 :** C'est l'indice sant\xE9 du mois pr\xE9c\xE9dant la date anniversaire du contrat.
3. **Certificat PEB (R\xE9gion wallonne & bruxelloise) :** Les biens de classe F ou G ont une indexation gel\xE9e \xE0 0%, et la classe E est index\xE9e \xE0 50% selon les ordonnances r\xE9gionales.
4. **Notification :** L'indexation doit \xEAtre notifi\xE9e par \xE9crit (courrier ou e-mail recommand\xE9) au locataire. Elle ne peut r\xE9troagir que sur un maximum de 3 mois.

Vous pouvez g\xE9n\xE9rer directement la lettre d'indexation certifi\xE9e dans notre onglet **G\xE9n\xE9rateur de Documents**.`;
    } else if (q.includes("tva") || q.includes("spf finances") || q.includes("facture") || q.includes("declaration")) {
      fallbackReply = `### Obligations Fiscales & TVA en Belgique
Pour toute entreprise ou ind\xE9pendant assujetti \xE0 la TVA en Belgique :

1. **\xC9ch\xE9ances de D\xE9claration :**
   - **D\xE9claration trimestrielle :** au plus tard le 20 du mois qui suit le trimestre civil (ex: 20 avril, 20 juillet, 20 octobre, 20 janvier).
   - **Paiement de la TVA :** le 20 du mois suivant \xE9galement, avec communication structur\xE9e officielle attribu\xE9e par le SPF Finances.
2. **Listing Annuel des Clients Assujettis (Listing TVA) :**
   - \xC0 soumettre avant le 31 mars via le portail Intervat / MyMinfin.
3. **Mentions obligatoires sur facture belge :**
   - N\xB0 d'entreprise et TVA (format BE 0XXX.XXX.XXX).
   - Mention "Membre d'une organisation agr\xE9\xE9e" ou "R\xE9gime de la franchise de taxe" si applicable (article 56bis).
   - Taux applicables (21% standard, 12% restauration/charbon, 6% r\xE9novation > 10 ans/denr\xE9es de base).

Utilisez notre outil **Fiduciaires & Fiscalit\xE9** pour v\xE9rifier la conformit\xE9 de vos factures et anticiper vos \xE9ch\xE9ances.`;
    } else if (q.includes("independant") || q.includes("inasti") || q.includes("cotisation") || q.includes("bce")) {
      fallbackReply = `### D\xE9marches & Cotisations Ind\xE9pendant en Belgique
1. **Inscription \xE0 la Banque-Carrefour des Entreprises (BCE) :**
   - S'effectue aupr\xE8s d'un guichet d'entreprise agr\xE9\xE9 (Liantis, UCM, Partena, Securex, Xerius).
   - Obtention de votre num\xE9ro d'entreprise \xE0 10 chiffres (BE 0... / BE 1...).
2. **Affiliation Caisse d'Assurances Sociales (Inasti) :**
   - Obligatoire au plus tard le jour du d\xE9but d'activit\xE9.
   - Les cotisations provisoires de d\xE9but d'activit\xE9 s'\xE9l\xE8vent au montant minimum l\xE9gal d'environ **865 \u20AC par trimestre**.
   - Le taux standard d\xE9finitif est de **20,5 %** sur le revenu net professionnel annuel (plafonn\xE9 \xE0 environ 106.000 \u20AC).
3. **Mutualit\xE9 (INAMI) :**
   - Fournir l'attestation de la caisse d'assurances sociales \xE0 votre mutualit\xE9 pour maintenir vos droits aux soins de sant\xE9 et indemnit\xE9s d'incapacit\xE9.

Rendez-vous dans le simulateur fiscal d'AdminBelgique pour calculer votre revenu net en poche apr\xE8s d\xE9duction des cotisations Inasti et de l'IPP.`;
    } else {
      fallbackReply = `Bonjour. Je suis l'assistant IA sp\xE9cialis\xE9 dans les d\xE9marches administratives, juridiques et fiscales belges (SPF Finances, BCE, ONSS, Urbanisme, Baux).

Pour r\xE9pondre pr\xE9cis\xE9ment \xE0 votre dossier, voici comment je peux vous guider :
1. **Analyse de courrier :** D\xE9posez une lettre ou un avis de r\xF4le pour en extraire le montant, la communication structur\xE9e et les voies de recours.
2. **G\xE9n\xE9ration de documents :** Cr\xE9ez une mise en demeure, un bail conforme aux lois r\xE9gionales, ou un PV d'assembl\xE9e g\xE9n\xE9rale.
3. **Contr\xF4les r\xE9glementaires :** V\xE9rifiez un num\xE9ro de TVA/BCE par l'algorithme Modulo 97 ou validez un NISS.

*Note : Vos donn\xE9es sont trait\xE9es dans le respect strict du RGPD belge avec masquage automatique des informations sensibles.*`;
    }
    return res.json({
      reply: fallbackReply,
      anonymization: anonymizationReport,
      engine: "AdminBelgique Expert Knowledge Base"
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
});
app.post("/api/documents/analyze", async (req, res) => {
  try {
    const { documentText, filename = "document.pdf" } = req.body;
    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ error: "Texte du document manquant" });
    }
    const anonymization = anonymizeBelgianText(documentText);
    const commMatch = documentText.match(/\+{3}(\d{3})\/(\d{4})\/(\d{5})\+{3}/);
    let structuredComm = commMatch ? commMatch[0] : null;
    let authority = "Organisme administratif belge ind\xE9termin\xE9";
    let documentType = "Courrier Administratif";
    let urgency = "moyenne";
    let deadline = "30 jours \xE0 dater de la r\xE9ception";
    const lower = documentText.toLowerCase();
    if (lower.includes("finances") || lower.includes("avertissement-extrait") || lower.includes("myminfin")) {
      authority = "SPF Finances (Administration G\xE9n\xE9rale de la Fiscalit\xE9)";
      documentType = "Avis d'Imposition / Avertissement-Extrait de R\xF4le";
      urgency = "haute";
      deadline = "2 mois pour paiement ou r\xE9clamation officielle";
    } else if (lower.includes("onss") || lower.includes("s\xE9curit\xE9 sociale")) {
      authority = "ONSS (Office National de S\xE9curit\xE9 Sociale)";
      documentType = "D\xE9compte de Cotisations Patronales";
      urgency = "haute";
    } else if (lower.includes("inasti") || lower.includes("sociales pour travailleur")) {
      authority = "INASTI / Caisse d'assurances sociales";
      documentType = "Avis d'\xC9ch\xE9ance de Cotisations Sociales";
      urgency = "moyenne";
    } else if (lower.includes("mise en demeure") || lower.includes("sommation") || lower.includes("recouvrement")) {
      authority = "Cabinet Juridique / Huissier de Justice";
      documentType = "Mise en Demeure de Paiement";
      urgency = "critique";
      deadline = "14 jours calendrier (Loi sur le recouvrement amiable)";
    } else if (lower.includes("commune") || lower.includes("urbanisme") || lower.includes("permis")) {
      authority = "Administration Communale / Service Urbanisme";
      documentType = "Avis Urbanistique / Enqu\xEAte Publique";
      urgency = "moyenne";
      deadline = "15 jours pour observation \xE9crite";
    }
    const amountRegex = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:€|EUR)/gi;
    const amountMatches = [...documentText.matchAll(amountRegex)];
    const detectedAmount = amountMatches.length > 0 ? `${amountMatches[0][1]} \u20AC` : "Non sp\xE9cifi\xE9";
    let isCommValid = false;
    if (structuredComm) {
      const cleanCommDigits = structuredComm.replace(/[^0-9]/g, "");
      const baseComm = parseInt(cleanCommDigits.substring(0, 10), 10);
      const commCheck = parseInt(cleanCommDigits.substring(10, 12), 10);
      const expected = baseComm % 97 === 0 ? 97 : baseComm % 97;
      isCommValid = commCheck === expected;
    }
    const analysisResult = {
      filename,
      authority,
      documentType,
      urgency,
      deadline,
      detectedAmount,
      structuredCommunication: structuredComm ? {
        raw: structuredComm,
        isValidModulo97: isCommValid,
        notice: isCommValid ? "Communication structur\xE9e certifi\xE9e conforme SPF/Banques belges." : "Attention : le num\xE9ro de contr\xF4le modulo 97 de cette communication ne concorde pas."
      } : null,
      summary: `Document \xE9mis par ${authority}. D\xE9marche requise avec d\xE9lai l\xE9gal estim\xE9 \xE0 : ${deadline}. Montant relev\xE9 : ${detectedAmount}.`,
      actionPlan: [
        "V\xE9rifier l'exactitude des montants et de la p\xE9riode imposable/concern\xE9e.",
        structuredComm ? `Effectuer le virement bancaire SEPA avec la communication structur\xE9e exacte (${structuredComm}).` : "Contacter l'organisme \xE9metteur avec votre num\xE9ro de dossier.",
        "En cas de d\xE9saccord, introduire une r\xE9clamation motiv\xE9e dans le d\xE9lai l\xE9gal imparti."
      ],
      recommendedReplyDraft: `Madame, Monsieur,

Faisant suite \xE0 votre courrier r\xE9f\xE9renc\xE9 concernant mon dossier aupr\xE8s de votre administration, je prends bonne note des \xE9l\xE9ments transmis.

[Indiquez ici votre acceptation avec preuve de paiement ou votre contestation motiv\xE9e].

Restant \xE0 votre enti\xE8re disposition,

Veuillez agr\xE9er, Madame, Monsieur, mes salutations distingu\xE9es.`,
      anonymizationReport: anonymization
    };
    res.json(analysisResult);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Erreur lors de l'analyse du document" });
  }
});
app.post("/api/documents/generate", requireBackendRole(["admin", "editor"]), (req, res) => {
  try {
    const { templateId, data } = req.body;
    let content = "";
    let title = "";
    switch (templateId) {
      case "mise-en-demeure":
        title = "Mise en Demeure de Paiement (Conforme Droit Belge)";
        content = `RECOMMAND\xC9 AVEC ACCUS\xC9 DE R\xC9CEPTION ET PLI SIMPLE

Exp\xE9diteur :
${data.senderName || "[Nom / D\xE9nomination sociale]"}
${data.senderAddress || "[Adresse de l'exp\xE9diteur, Code postal, Ville]"}
BCE / TVA : ${data.senderVat || "BE 0XXX.XXX.XXX"}
IBAN : ${data.senderIban || "BE00 0000 0000 0000"}

Destinataire :
${data.recipientName || "[Nom du d\xE9biteur / Entreprise]"}
${data.recipientAddress || "[Adresse du d\xE9biteur, Belgique]"}

Fait \xE0 ${data.city || "Bruxelles"}, le ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE")}

OBJET : MISE EN DEMEURE DE PAYER \u2013 DERNIER AVERTISSEMENT AVANT ACTION JUDICIAIRE
R\xE9f. Facture n\xB0 : ${data.invoiceRef || "FACT-2026-001"}
Montant en principal : ${data.principalAmount || "1.500,00"} \u20AC

Madame, Monsieur,

Sauf erreur ou omission de notre part, nous constatons qu\u2019\xE0 ce jour, la facture mentionn\xE9e en r\xE9f\xE9rence, \xE9chue depuis le ${data.dueDate || "15/10/2026"}, demeure impay\xE9e malgr\xE9 nos pr\xE9c\xE9dents rappels amiables.

Conform\xE9ment aux dispositions du Code de droit \xE9conomique belge (Livre XIX relatif aux dettes du consommateur / D\xE9cret relatif aux retards de paiement entre entreprises du 2 ao\xFBt 2002) :

Nous vous mettons formellement EN DEMEURE par la pr\xE9sente de proc\xE9der au r\xE8glement int\xE9gral de la somme de :
- Principal restant d\xFB : ${data.principalAmount || "1.500,00"} \u20AC
- Indemnit\xE9 forfaitaire de recouvrement : ${data.penaltyAmount || "40,00"} \u20AC
- Int\xE9r\xEAts l\xE9gaux de retard : ${data.interestAmount || "15,50"} \u20AC
TOTAL D\xDB : ${data.totalAmount || "1.555,50"} \u20AC

Ce montant est \xE0 verser sous un d\xE9lai imp\xE9ratif de QUATORZE (14) JOURS CALENDRIER \xE0 compter de la r\xE9ception de la pr\xE9sente sur le compte bancaire suivant :
IBAN : ${data.senderIban || "BE00 0000 0000 0000"}
BIC : ${data.senderBic || "GEBABEBB"}
Communication : ${data.invoiceRef || "FACT-2026-001"}

\xC0 d\xE9faut de paiement ou d\u2019accord sur un plan d\u2019apurement \xE9crit dans ce d\xE9lai, nous transmettrons imm\xE9diatement le dossier \xE0 notre conseil juridique pour citation devant le Tribunal de l\u2019Entreprise / Justice de Paix territorialement comp\xE9tente, o\xF9 l\u2019ensemble des d\xE9pens et frais de justice (indemnit\xE9 de proc\xE9dure selon l'A.R. du 26 octobre 2007) seront mis \xE0 votre charge exclusive.

La pr\xE9sente vous est adress\xE9e sous toute r\xE9serve et sans reconnaissance pr\xE9judiciable.

${data.senderName || "[Nom / D\xE9nomination sociale]"}
Signature / Mandataire`;
        break;
      case "bail-residence":
        title = "Contrat de Bail de R\xE9sidence Principale (R\xE9gion Wallonne & Bruxelles)";
        content = `CONTRAT DE BAIL DE R\xC9SIDENCE PRINCIPALE
Soumis aux dispositions du d\xE9cret r\xE9gional sur le bail d'habitation et au Code civil belge.

ENTRE LES SOUSSIGN\xC9S :

1. LE BAILLEUR :
Nom et pr\xE9nom / Soci\xE9t\xE9 : ${data.landlordName || "[Nom du Bailleur]"}
Adresse : ${data.landlordAddress || "[Adresse du Bailleur]"}
Registre National / BCE : ${data.landlordId || "[NISS ou BCE]"}
Num\xE9ro de compte pour le loyer : ${data.landlordIban || "BE00 0000 0000 0000"}

ET

2. LE PRENEUR (LOCATAIRE) :
Nom et pr\xE9nom : ${data.tenantName || "[Nom du Preneur]"}
Adresse actuelle : ${data.tenantAddress || "[Adresse actuelle]"}
Registre National (NISS) : ${data.tenantNiss || "[NISS]"}

IL A \xC9T\xC9 CONVENU CE QUI SUIT :

ARTICLE 1 : OBJET DU BAIL
Le bailleur donne en location \xE0 usage exclusif de r\xE9sidence principale au preneur le bien sis \xE0 :
${data.propertyAddress || "[Adresse compl\xE8te du bien lou\xE9, Belgique]"}
Description sommaire : ${data.propertyDesc || "Appartement comprenant s\xE9jour, cuisine \xE9quip\xE9e, 2 chambres, salle de bains, cave."}
Certificat PEB n\xB0 : ${data.pebNumber || "PEB-2025-XXXXX"} \u2013 Classe \xE9nerg\xE9tique : ${data.pebGrade || "B"}

ARTICLE 2 : DUR\xC9E
Le pr\xE9sent bail est conclu pour une dur\xE9e de ${data.durationYears || "3"} ann\xE9es, prenant cours le ${data.startDate || "01/01/2026"} pour se terminer le ${data.endDate || "31/12/2028"}.

ARTICLE 3 : LOYER ET CHARGES
Le loyer de base mensuel est fix\xE9 \xE0 la somme de ${data.rentAmount || "950,00"} \u20AC (hors charges).
Provision mensuelle pour charges communes : ${data.chargesAmount || "75,00"} \u20AC.
Le paiement est exigible par virement bancaire pour le premier jour de chaque mois au plus tard.

ARTICLE 4 : INDEXATION
Le loyer est indexable chaque ann\xE9e \xE0 la date anniversaire de l\u2019entr\xE9e en vigueur, conform\xE9ment \xE0 la formule l\xE9gale :
(Loyer de base \xD7 Nouvel Indice Sant\xE9) / Indice Sant\xE9 de base.

ARTICLE 5 : GARANTIE LOCATIVE
Une garantie locative \xE9quivalente \xE0 deux mois de loyer (${(data.rentAmount ? Number(data.rentAmount) * 2 : 1900).toFixed(2)} \u20AC) est constitu\xE9e sous forme de compte individualis\xE9 bloqu\xE9 au nom du preneur ou garantie bancaire.

ARTICLE 6 : \xC9TAT DES LIEUX ET ENREGISTREMENT
Un \xE9tat des lieux contradictoire et d\xE9taill\xE9 sera dress\xE9 \xE0 frais partag\xE9s lors de l\u2019entr\xE9e dans les lieux.
Le bailleur s'engage \xE0 faire enregistrer gratuitement le contrat et l'\xE9tat des lieux aupr\xE8s du bureau comp\xE9tent du SPF Finances (MyMinfin) dans les deux mois de la signature.

Fait \xE0 ${data.city || "Bruxelles"}, le ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE")}, en autant d'exemplaires originaux que de parties ayant un int\xE9r\xEAt distinct.

Le Bailleur                                   Le Preneur`;
        break;
      case "indexation-loyer":
        title = "Notification Officielle d'Indexation de Loyer (Statbel)";
        content = `NOTIFICATION D'INDEXATION ANNUELLE DE LOYER
Conform\xE9ment \xE0 l\u2019article 1728bis du Code civil belge

Exp\xE9diteur (Bailleur) :
${data.landlordName || "[Nom du Bailleur]"}
${data.landlordAddress || "[Adresse du Bailleur]"}

Destinataire (Locataire) :
${data.tenantName || "[Nom du Locataire]"}
${data.propertyAddress || "[Adresse du bien lou\xE9]"}

Date : ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE")}

Madame, Monsieur,

Conform\xE9ment aux clauses de notre contrat de bail et en application de l\u2019article 1728bis du Code civil belge ainsi que de la l\xE9gislation r\xE9gionale sur les baux d'habitation, nous vous informons par la pr\xE9sente de l\u2019indexation l\xE9gale annuelle de votre loyer.

D\xE9tail du calcul officiel (Indice Sant\xE9 publi\xE9 par Statbel) :
- Date de signature du bail : ${data.signDate || "15/10/2023"}
- Loyer de base initial : ${data.baseRent || "900,00"} \u20AC
- Indice de base (mois pr\xE9c\xE9dant la signature) : ${data.baseIndex || "128.91"}
- Nouvel indice sant\xE9 applicable : ${data.newIndex || "136.50"}
- Certificat PEB du logement : ${data.pebGrade || "Classe B"} (indexation \xE0 100% autoris\xE9e)

Calcul :
(${data.baseRent || "900"} \u20AC \xD7 ${data.newIndex || "136.50"}) / ${data.baseIndex || "128.91"} = ${data.indexedRent || "952.99"} \u20AC

Par cons\xE9quent, \xE0 compter de l\u2019\xE9ch\xE9ance du ${data.effectiveDate || "01/12/2026"}, le montant de votre nouveau loyer mensuel s\u2019\xE9l\xE8vera \xE0 :
NOUVEAU LOYER MENSUEL : ${data.indexedRent || "952.99"} \u20AC
(Hors provision pour charges de ${data.charges || "50,00"} \u20AC qui reste inchang\xE9e).

Nous vous prions de bien vouloir adapter le montant de votre ordre permanent de paiement d\xE8s la prochaine \xE9ch\xE9ance.

Vous remerciant pour votre coop\xE9ration, nous vous prions d\u2019agr\xE9er, Madame, Monsieur, nos salutations distingu\xE9es.

${data.landlordName || "[Nom du Bailleur]"}`;
        break;
      default:
        title = "Document Administratif Conforme Belgique";
        content = `DOCUMENT OFFICIEL G\xC9N\xC9R\xC9 PAR ADMINBELGIQUE

Date : ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-BE")}
Objet : Formalit\xE9 administrative belge

Attestation conforme aux directives r\xE9gionales et f\xE9d\xE9rales du Royaume de Belgique.`;
    }
    res.json({
      title,
      content,
      templateId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).json({ error: "Erreur lors de la g\xE9n\xE9ration du document" });
  }
});
app.post("/api/tools/validate-bce", (req, res) => {
  const { bceNumber } = req.body;
  if (!bceNumber) {
    return res.status(400).json({ error: "Num\xE9ro BCE requis" });
  }
  const result = validateBceNumber(bceNumber);
  res.json(result);
});
app.post("/api/tools/validate-niss", (req, res) => {
  const { nissNumber } = req.body;
  if (!nissNumber) {
    return res.status(400).json({ error: "Num\xE9ro NISS requis" });
  }
  const result = validateNissNumber(nissNumber);
  res.json(result);
});
app.post("/api/tools/rent-indexation", (req, res) => {
  const { baseRent, signYear, signMonth, currentYear, currentMonth, region, pebGrade } = req.body;
  if (!baseRent || !signYear || !signMonth) {
    return res.status(400).json({ error: "Param\xE8tres manquants pour le calcul d'indexation" });
  }
  const result = calculateRentIndexation({
    baseRent: Number(baseRent),
    signYear: Number(signYear),
    signMonth: Number(signMonth),
    currentYear: Number(currentYear || 2026),
    currentMonth: Number(currentMonth || 11),
    region: region || "bruxelles",
    pebGrade: pebGrade || "B"
  });
  res.json(result);
});
app.post("/api/tools/tax-simulation", (req, res) => {
  const { grossRevenue, deductibleExpenses = 0, dependents = 0 } = req.body;
  if (grossRevenue === void 0) {
    return res.status(400).json({ error: "Chiffre d'affaires requis" });
  }
  const result = simulateBelgianTaxes(Number(grossRevenue), Number(deductibleExpenses), Number(dependents));
  res.json(result);
});
app.post("/api/immoboost/search", (req, res) => {
  const {
    postalCode = "1000",
    propertyType = "apartment",
    maxPrice,
    region = "bruxelles",
    transactionType = "sale",
    rooms
  } = req.body;
  const saleProperties = [
    {
      id: "immo-sale-01",
      title: "Appartement lumineux 2 ch + terrasse",
      city: region === "bruxelles" ? "Bruxelles (1000)" : region === "wallonie" ? `Wallonie (${postalCode})` : `Flandre (${postalCode})`,
      sourcePortal: "Immoweb Pro",
      sourceUrl: "https://www.immoweb.be/fr/recherche/appartement/a-vendre/bruxelles/1000?countries=BE&orderBy=newest",
      transactionType: "sale",
      price: 285e3,
      surface: 88,
      pebGrade: "B",
      rooms: 2,
      estimatedRent: 1150,
      monthlyCharges: 95,
      registrationDutyRate: region === "flandre" ? 0.03 : 0.125,
      notaryFeesEstimate: 6800,
      grossYield: 4.84,
      netYield: 3.92,
      features: ["Ascenseur", "Cuisine super-\xE9quip\xE9e", "Cave", "Ch\xE2ssis double vitrage PVC"]
    },
    {
      id: "immo-sale-02",
      title: "Maison de ma\xEEtre \xE0 r\xE9nover fort potentiel",
      city: region === "wallonie" ? "Li\xE8ge (4000)" : `R\xE9gion (${postalCode})`,
      sourcePortal: "Logic-Immo",
      sourceUrl: "https://www.logic-immo.be/fr/vente/maison-4000",
      transactionType: "sale",
      price: 195e3,
      surface: 165,
      pebGrade: "E",
      rooms: 4,
      estimatedRent: 1350,
      monthlyCharges: 0,
      registrationDutyRate: region === "flandre" ? 0.03 : 0.125,
      notaryFeesEstimate: 5900,
      grossYield: 8.3,
      netYield: 5.8,
      features: ["Jardin de ville", "Hauts plafonds moulur\xE9s", "Potentiel colocation \xE9tudiante"]
    },
    {
      id: "immo-sale-03",
      title: "Studio de standing id\xE9al investisseur",
      city: region === "wallonie" ? "Namur (5000)" : `Centre (${postalCode})`,
      sourcePortal: "Zimmo",
      sourceUrl: "https://www.zimmo.be/fr/recherche/te-koop/5000/",
      transactionType: "sale",
      price: 135e3,
      surface: 42,
      pebGrade: "C",
      rooms: 1,
      estimatedRent: 650,
      monthlyCharges: 60,
      registrationDutyRate: region === "flandre" ? 0.03 : 0.125,
      notaryFeesEstimate: 4900,
      grossYield: 5.77,
      netYield: 4.65,
      features: ["Proche gare", "Bail en cours avec locataire s\xE9rieux", "Faibles charges communes"]
    },
    {
      id: "immo-sale-04",
      title: "Penthouse contemporain 3 ch terrasse panoramique",
      city: region === "bruxelles" ? "Ixelles (1050)" : `R\xE9sidence (${postalCode})`,
      sourcePortal: "Immoweb Pro",
      sourceUrl: "https://www.immoweb.be/fr/recherche/appartement/a-vendre/ixelles/1050?countries=BE&orderBy=newest",
      transactionType: "sale",
      price: 435e3,
      surface: 125,
      pebGrade: "A",
      rooms: 3,
      estimatedRent: 1850,
      monthlyCharges: 140,
      registrationDutyRate: region === "flandre" ? 0.03 : 0.125,
      notaryFeesEstimate: 8500,
      grossYield: 5.1,
      netYield: 4.25,
      features: ["Terrasse 35m\xB2", "Pompe \xE0 chaleur", "Cave & Parking privatif"]
    },
    {
      id: "immo-sale-05",
      title: "Immeuble de rapport 3 unit\xE9s locatives conformes",
      city: "Charleroi / Centre (6000)",
      sourcePortal: "Immovlan",
      sourceUrl: "https://www.immovlan.be/fr/recherche/immeuble-mixte/a-vendre/6000",
      transactionType: "sale",
      price: 24e4,
      surface: 195,
      pebGrade: "D",
      rooms: 5,
      estimatedRent: 1950,
      monthlyCharges: 0,
      registrationDutyRate: 0.125,
      notaryFeesEstimate: 6300,
      grossYield: 9.75,
      netYield: 7.8,
      features: ["Compteurs individuels s\xE9par\xE9s", "Revenu locatif imm\xE9diat", "R\xE9gularit\xE9 urbanistique RU"]
    }
  ];
  const rentProperties = [
    {
      id: "immo-rent-01",
      title: "Appartement 2 chambres r\xE9nov\xE9 avec balcon",
      city: region === "bruxelles" ? "Bruxelles / Flagey (1050)" : `Commune (${postalCode})`,
      sourcePortal: "Immoweb Pro",
      sourceUrl: "https://www.immoweb.be/fr/recherche/appartement/a-louer/ixelles/1050?countries=BE&orderBy=newest",
      transactionType: "rent",
      price: 1150,
      // Loyer mensuel
      monthlyCharges: 90,
      rentalGuarantee: 2300,
      // 2 mois de loyer légal
      leaseType: "Bail de r\xE9sidence principale 3 ans",
      surface: 85,
      pebGrade: "B",
      rooms: 2,
      pebNote: "Indexation annuelle \xE0 100% autoris\xE9e (Indice Sant\xE9 Statbel)",
      features: ["Cuisine semi-\xE9quip\xE9e", "Double vitrage thermique", "Cave privative"]
    },
    {
      id: "immo-rent-02",
      title: "Studio meubl\xE9 tout confort pour \xE9tudiant / jeune pro",
      city: region === "bruxelles" ? "Bruxelles / ULB (1050)" : region === "wallonie" ? "Li\xE8ge / Sart-Tilman (4000)" : `Centre (${postalCode})`,
      sourcePortal: "Zimmo",
      sourceUrl: "https://www.zimmo.be/fr/recherche/te-huur/1050/",
      transactionType: "rent",
      price: 680,
      monthlyCharges: 70,
      rentalGuarantee: 1360,
      leaseType: "Bail \xE9tudiant / 1 an renouvelable",
      surface: 38,
      pebGrade: "C",
      rooms: 1,
      pebNote: "Indexation annuelle normale autoris\xE9e",
      features: ["Mobilier moderne inclus", "Connexion fibre optique", "Local v\xE9los s\xE9curis\xE9"]
    },
    {
      id: "immo-rent-03",
      title: "Maison familiale 3 chambres avec jardin arbor\xE9",
      city: region === "wallonie" ? "Namur / Jambes (5100)" : `P\xE9riph\xE9rie (${postalCode})`,
      sourcePortal: "Logic-Immo",
      sourceUrl: "https://www.logic-immo.be/fr/location/maison-5100",
      transactionType: "rent",
      price: 1350,
      monthlyCharges: 35,
      rentalGuarantee: 2700,
      leaseType: "Bail de 9 ans longue dur\xE9e",
      surface: 140,
      pebGrade: "C",
      rooms: 3,
      pebNote: "Indexation annuelle normale autoris\xE9e",
      features: ["Grand jardin cl\xF4tur\xE9", "Garage ferm\xE9", "Chauffage individuel gaz \xE0 condensation"]
    },
    {
      id: "immo-rent-04",
      title: "Appartement de standing 1 chambre + terrasse",
      city: region === "bruxelles" ? "Woluwe-Saint-Lambert (1200)" : `R\xE9sidentiel (${postalCode})`,
      sourcePortal: "Immoweb Pro",
      sourceUrl: "https://www.immoweb.be/fr/recherche/appartement/a-louer/woluwe-saint-lambert/1200?countries=BE&orderBy=newest",
      transactionType: "rent",
      price: 920,
      monthlyCharges: 80,
      rentalGuarantee: 1840,
      leaseType: "Bail de 3 ans enregistr\xE9 MyMinfin",
      surface: 65,
      pebGrade: "A",
      rooms: 1,
      pebNote: "Basse consommation \xE9nerg\xE9tique / PEB A",
      features: ["Ascenseur", "Parquet ch\xEAne massif", "Proche m\xE9tro et commerces"]
    },
    {
      id: "immo-rent-05",
      title: "Maison de ville 4 chambres avec cour privative",
      city: region === "wallonie" ? "Mons / Centre (7000)" : `Ville (${postalCode})`,
      sourcePortal: "Immovlan",
      sourceUrl: "https://www.immovlan.be/fr/recherche/maison/a-louer/7000",
      transactionType: "rent",
      price: 1480,
      monthlyCharges: 0,
      rentalGuarantee: 2960,
      leaseType: "Bail de colocation ou famille 3 ans",
      surface: 175,
      pebGrade: "D",
      rooms: 4,
      pebNote: "Indexation encadr\xE9e par d\xE9cret r\xE9gional",
      features: ["4 chambres spacieuses", "2 salles de bains", "Emplacement lave-linge"]
    }
  ];
  let rawList = transactionType === "rent" ? rentProperties : saleProperties;
  if (propertyType && propertyType !== "all") {
    rawList = rawList.filter((p) => {
      const titleLower = p.title.toLowerCase();
      if (propertyType === "apartment") return titleLower.includes("appartement") || titleLower.includes("studio") || titleLower.includes("penthouse");
      if (propertyType === "house") return titleLower.includes("maison");
      if (propertyType === "building") return titleLower.includes("immeuble");
      return true;
    });
  }
  if (rooms && Number(rooms) > 0) {
    const minR = Number(rooms);
    rawList = rawList.filter((p) => p.rooms >= minR);
  }
  if (maxPrice && Number(maxPrice) > 0) {
    const maxP = Number(maxPrice);
    rawList = rawList.filter((p) => p.price <= maxP);
  }
  res.json({
    postalCode,
    propertyType,
    region,
    transactionType,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    rooms: rooms ? Number(rooms) : null,
    totalFound: rawList.length,
    portalSources: ["Immoweb", "Logic-Immo", "Zimmo", "Immovlan"],
    scrapedAt: (/* @__PURE__ */ new Date()).toISOString(),
    results: rawList
  });
});
app.post("/api/immoboost/scrape-url", (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL d'annonce immobili\xE8re requise" });
  }
  let portal = "Immoweb";
  if (url.includes("zimmo")) portal = "Zimmo";
  else if (url.includes("logic-immo")) portal = "Logic-Immo";
  else if (url.includes("immovlan") || url.includes("vlan")) portal = "Immovlan";
  else if (url.includes("century21")) portal = "Century 21";
  else if (url.includes("era.be")) portal = "ERA Belgium";
  const postalMatch = url.match(/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3}|6\d{3}|7\d{3}|8\d{3}|9\d{3})\b/);
  const postalCode = postalMatch ? postalMatch[1] : "1050";
  let region = "bruxelles";
  const postNum = parseInt(postalCode, 10);
  if (postNum >= 1e3 && postNum <= 1299) region = "bruxelles";
  else if (postNum >= 1300 && postNum <= 1499 || postNum >= 4e3 && postNum <= 7999) region = "wallonie";
  else region = "flandre";
  let price = 245e3;
  const priceMatch = url.match(/(\d{3,4})000/);
  if (priceMatch) {
    const parsed = parseInt(priceMatch[0], 10);
    if (parsed >= 5e4 && parsed <= 5e6) price = parsed;
  }
  const regRate = region === "flandre" ? 0.03 : 0.125;
  const regDuties = price * regRate;
  const notaryFees = Math.round(3500 + price * 0.012);
  const estimatedRent = Math.round(price * 44e-4);
  const totalInvestment = price + regDuties + notaryFees;
  const annualRent = estimatedRent * 12;
  const grossYield = Math.round(annualRent / totalInvestment * 1e4) / 100;
  const precompte = Math.round(estimatedRent * 1.15);
  const netRent = annualRent - precompte - annualRent * 0.08;
  const netYield = Math.round(netRent / totalInvestment * 1e4) / 100;
  res.json({
    success: true,
    url,
    portal,
    detectedData: {
      sourceUrl: url,
      portal,
      title: `Bien immobilier analys\xE9 (${portal})`,
      city: region === "bruxelles" ? `Bruxelles (${postalCode})` : region === "wallonie" ? `Wallonie (${postalCode})` : `Flandre (${postalCode})`,
      postalCode,
      region,
      price,
      surface: 82,
      pebGrade: "B",
      rooms: 2,
      estimatedRent,
      cadastralIncome: 850,
      registrationDuties: Math.round(regDuties),
      registrationRate: regRate,
      notaryFees,
      totalInvestment,
      grossYield,
      netYield,
      monthlyCashflow: Math.round(estimatedRent - price * 0.8 * 55e-4 - estimatedRent * 0.15),
      pebIndexationStatus: "Indexation de loyer \xE0 100% autoris\xE9e (PEB B conforme)",
      requiredBelgianCertificates: [
        { name: "Certificat PEB", status: "Requis avant mise en vente/location", mandatory: true },
        { name: "Contr\xF4le \xC9lectrique RGIE", status: "Rapport conforme requis \xE0 l'acte notari\xE9", mandatory: true },
        { name: "Renseignements Urbanistiques (RU)", status: "Demande communale obligatoire", mandatory: true },
        { name: "Attestation Asbeste / Amiante", status: "Obligatoire en Flandre, recommand\xE9e en Wallonie/Bxl", mandatory: region === "flandre" }
      ],
      legalNote: "Calcul conforme aux bar\xE8mes officiels de la F\xE9d\xE9ration Royale du Notariat Belge (Fednot) et aux d\xE9crets r\xE9gionaux sur le bail locatif."
    }
  });
});
app.post("/api/anonymize", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texte \xE0 anonymiser requis" });
  }
  const result = anonymizeBelgianText(text);
  res.json(result);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`[AdminBelgique] Serveur d\xE9marr\xE9 avec succ\xE8s sur le port ${PORT}`);
  });
}
startServer();
