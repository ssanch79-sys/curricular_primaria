
import { Activity, ValidationReport, ValidationIssue } from '../types';

/**
 * Servei de validació basat en el Decret 175/2022.
 * Verifica que la Situació d'Aprenentatge (SA) compleix els requisits mínims.
 */
export const validateActivity = (activity: Partial<Activity>): ValidationReport => {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // 1. Dades bàsiques
  if (!activity.title || activity.title.trim().length < 5) {
    issues.push({
      id: 'title-missing',
      type: 'error',
      message: 'El títol és massa curt o inexistent.',
      field: 'title',
      requirement: 'Identificació de la SA'
    });
    score -= 15;
  }

  if (!activity.description || activity.description.trim().length < 20) {
    issues.push({
      id: 'description-short',
      type: 'error',
      message: 'La descripció ha de ser prou detallada per contextualitzar el repte.',
      field: 'description',
      requirement: 'Contextualització i Repte'
    });
    score -= 15;
  }

  // 2. Àrees
  if (!activity.subjectIds || activity.subjectIds.length === 0) {
    issues.push({
      id: 'subjects-missing',
      type: 'error',
      message: 'Cal seleccionar almenys una àrea curricular.',
      field: 'subjectIds',
      requirement: 'Vinculació amb les àrees'
    });
    score -= 20;
  }

  // 3. Elements Curriculars
  const competencies = activity.competencies || [];
  const criteria = activity.criteria || [];
  const sabers = activity.sabers || [];

  if (competencies.length === 0) {
    issues.push({
      id: 'competencies-missing',
      type: 'error',
      message: 'No s\'han seleccionat Competències Específiques.',
      field: 'competencies',
      requirement: 'Perfil Competencial (Decret 175/2022)'
    });
    score -= 15;
  }

  if (criteria.length === 0) {
    issues.push({
      id: 'criteria-missing',
      type: 'error',
      message: 'No s\'han definit Criteris d\'Avaluació.',
      field: 'criteria',
      requirement: 'Avaluació Competencial'
    });
    score -= 15;
  }

  if (sabers.length === 0) {
    issues.push({
      id: 'sabers-missing',
      type: 'warning',
      message: 'Es recomana vincular Sabers Bàsics per concretar els continguts.',
      field: 'sabers',
      requirement: 'Continguts i Sabers'
    });
    score -= 5;
  }

  // 4. Seqüència Didàctica
  const sessions = activity.detailedActivities || [];
  if (sessions.length === 0) {
    issues.push({
      id: 'sessions-missing',
      type: 'error',
      message: 'La SA ha de tenir almenys una sessió o activitat planificada.',
      field: 'detailedActivities',
      requirement: 'Seqüència Didàctica'
    });
    score -= 20;
  } else {
    // Verificar DUA en les sessions
    const sessionsWithoutDua = sessions.filter(s => !s.dua || s.dua.trim().length < 10);
    if (sessionsWithoutDua.length > 0) {
      issues.push({
        id: 'dua-missing',
        type: 'warning',
        message: `Hi ha ${sessionsWithoutDua.length} sessions sense mesures d'atenció a la diversitat (DUA) detallades.`,
        field: 'detailedActivities',
        requirement: 'Atenció a la Diversitat (DUA)'
      });
      score -= 10;
    }
  }

  // 5. Competències Transversals (Opcional però recomanat)
  const hasTransversal = activity.subjectIds?.some(id => 
    ['digital', 'ciutadana', 'emprenedora', 'personal'].includes(id)
  );
  if (!hasTransversal) {
    issues.push({
      id: 'transversal-missing',
      type: 'warning',
      message: 'Es recomana incloure Competències Transversals (Digital, Personal...).',
      field: 'subjectIds',
      requirement: 'Caràcter Transversal'
    });
    score -= 5;
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    score: Math.max(0, score),
    issues
  };
};
