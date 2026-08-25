import { localDb } from './supabase';

/**
 * Offline Draft Service
 * Handles auto-saving in-progress inspections and offline sync
 */

export function saveInspectionDraft(draftData) {
  if (!draftData) return;
  const payload = {
    ...draftData,
    lastSavedAt: new Date().toISOString(),
    isDraft: true
  };
  localDb.saveDraft(payload);
  return payload;
}

export function getInspectionDraft() {
  return localDb.getDraft();
}

export function clearInspectionDraft() {
  localDb.clearDraft();
}

export function hasPendingDraft() {
  const draft = getInspectionDraft();
  return Boolean(draft && draft.items && draft.items.length > 0);
}
