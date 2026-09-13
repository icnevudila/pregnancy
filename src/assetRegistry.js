/**
 * MOMORA Approved Brand Asset Registry
 * Codifies custom 3D artwork, illustrations, and icon usage rules.
 * Reference: 02_DESIGN_SYSTEM_FREEZE.md & uyarı notu.md
 */

import { generatedAssets } from './generatedAssets';

export const AssetCategories = {
  TOOL_ICONS: 'tool_icons',
  SIZE_COMPARISON: 'size_comparison',
  ANATOMY_3D: 'anatomy_3d',
  EDITORIAL: 'editorial',
  CARE_QUICK: 'care_quick',
};

/**
 * 16 Core Tool Icons that have been normalized to 384x384 with 310px optical weight
 */
export const TOOL_ICON_REGISTRY = [
  'card_kick_counter',
  'card_contractions',
  'card_scale',
  'sweet_macaron',
  'ui_timeline_sun_moon',
  'ui_fetal_heart_3d',
  'ui_hospital_bag_3d',
  'ui_birth_plan_scroll',
  'ui_doctor_prep_notebook',
  'ui_baby_name_blocks',
  'ui_nursing_dual_timer',
  'ui_white_noise_headphones',
  'ui_diaper_wet_drop',
  'ui_postpartum_lotus',
  'btn_breast_pump',
  'topic_partner_guide',
];

/**
 * Validates if an asset key belongs to the approved brand assets
 */
export function isApprovedAsset(assetKey) {
  return Boolean(generatedAssets[assetKey]);
}

/**
 * Asset rendering guidelines
 */
export const ASSET_RULES = {
  resizeMode: 'contain',
  canvasScale: 384,
  opticalInnerScale: 310,
  noTint: true,
  noFilter: true,
  noEmojiSubstitution: true,
};

export default {
  TOOL_ICON_REGISTRY,
  isApprovedAsset,
  ASSET_RULES,
};
