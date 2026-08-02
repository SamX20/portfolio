import { ProjectCategory } from '@/types';

export interface ProjectMetadataInput {
  sourceFileName: string;
  duration: number;
  width: number;
  height: number;
  analysisImage: string;
  existingProjects: ProjectMetadataCandidate[];
}

export interface ProjectMetadataCandidate {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  client: string;
  year: number;
  category: ProjectCategory[];
}

export interface ProjectMetadataSuggestion {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  category: ProjectCategory[];
  role: string;
  technologies: string[];
  review_notes: string[];
  matched_project_id: string;
  match_confidence: number;
  match_reason: string;
}

export const PROJECT_CATEGORY_VALUES: ProjectCategory[] = [
  'motion-design',
  'social-ads',
  'brand-films',
  'explainer',
  'video-editing',
  'logo-animation',
  '3d-modelling',
  'anime-edit',
];

export const PORTFOLIO_TECHNOLOGIES = [
  'After Effects',
  'Premiere Pro',
  'Illustrator',
  'Photoshop',
  'Blender 3D',
  'DaVinci Resolve',
  'AI Tools',
];

export function isProjectMetadataSuggestion(value: unknown): value is ProjectMetadataSuggestion {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  const requiredText = ['title', 'title_ar', 'description', 'description_ar', 'role'];
  if (!requiredText.every((key) => typeof candidate[key] === 'string' && candidate[key].trim())) {
    return false;
  }

  if (!Array.isArray(candidate.category) || !candidate.category.length) return false;
  if (!candidate.category.every((category) => PROJECT_CATEGORY_VALUES.includes(category as ProjectCategory))) {
    return false;
  }

  return Array.isArray(candidate.technologies)
    && candidate.technologies.every((technology) => typeof technology === 'string')
    && Array.isArray(candidate.review_notes)
    && candidate.review_notes.every((note) => typeof note === 'string')
    && typeof candidate.matched_project_id === 'string'
    && typeof candidate.match_confidence === 'number'
    && Number.isFinite(candidate.match_confidence)
    && candidate.match_confidence >= 0
    && candidate.match_confidence <= 100
    && typeof candidate.match_reason === 'string';
}
